#!/usr/bin/env python3
"""Render Cursor rules from lib/rules. Edit the lib, then run this file."""

import json
from pathlib import Path

PLUGIN = Path(__file__).resolve().parent
LIB = PLUGIN / "lib" / "rules"
OUT = PLUGIN / "rules"


def main() -> None:
    manifest = json.loads((LIB / "manifest.json").read_text())
    OUT.mkdir(exist_ok=True)
    written = set()
    for name, meta in manifest.items():
        body = "\n" + (LIB / f"{name}.md").read_text().strip() + "\n"
        lines = ["---"]
        for key in ("description", "alwaysApply", "globs"):
            if key not in meta:
                continue
            value = meta[key]
            if isinstance(value, bool):
                value = "true" if value else "false"
            lines.append(f"{key}: {value}")
        lines.append("---")
        lines.append("")
        text = "\n".join(lines) + body
        target = OUT / f"{name}.mdc"
        target.write_text(text)
        written.add(target.name)
    for stale in OUT.glob("*.mdc"):
        if stale.name not in written:
            stale.unlink()


if __name__ == "__main__":
    main()
