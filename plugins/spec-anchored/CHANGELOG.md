# Changelog

## 0.1.0 — 2026-10-21

- Initial local Cursor plugin.
- Harness-neutral operational layer: principles, spec interview and writing, shared implementation protocol (phases 0–10), three mode adapters, two internal authoring agents, and capability templates.
- The executable-contracts kernel stays in the upstream bundle. `prep` describes the repository verification interface and points at that bundle as an optional install.

## 0.2.0 — 2026-10-22

- Shared procedure moves to `lib/`. Cursor, Claude Code, and Codex each keep their own manifest and discovery format.
- Cursor rules (`rules/*.mdc`) are rendered from `lib/rules/` by `render.py`.
- Repository renamed to `agent-plugins`.

## Unreleased

- `shape` asks the frontier through the host's structured question tool (`AskUserQuestion` in Claude Code) when one exists; a numbered text list is the fallback.
- `prep` gains an optional Phase 4b: after asking the human, it installs `/approve` spec approval from `templates/spec-approval/` (a workflow that fills `approved_by`/`approved_at` from a pull request comment, plus a guard check that fails when a spec changes after approval).
- `/approve` also sets `status: ratified` on the pull request branch; it takes effect on merge into the default branch. The guard fails on `ratified` without approval and on an approved spec that is not `ratified`. Push of the approval commit is a compare-and-swap on the reviewed head.
