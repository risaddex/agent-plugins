# Changelog

## 0.1.0 — 2026-10-21

- Initial local Cursor plugin.
- Harness-neutral operational layer: principles, spec interview and writing, shared implementation protocol (phases 0–10), three mode adapters, two internal authoring agents, and capability templates.
- The executable-contracts kernel stays in the upstream bundle. `prep` describes the repository verification interface and points at that bundle as an optional install.

## 0.2.0 — 2026-10-22

- Shared procedure moves to `lib/`. Cursor, Claude Code, and Codex each keep their own manifest and discovery format.
- Cursor rules (`rules/*.mdc`) are rendered from `lib/rules/` by `render.py`.
- Repository renamed to `agent-plugins`.
