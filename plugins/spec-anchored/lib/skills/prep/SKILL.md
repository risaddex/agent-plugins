---
name: prep
description: Prepare a repository's verification interface for spec-anchored work. Use only on explicit invocation. Detect and extend. Does not change application code and does not vendor the upstream kernel.
---

# prep

Prepare this repository so the Owner, the two internal agents, and CI share one verification interface. Read before writing. Extend what exists. Flag every workaround. No application code changes.

## Phase 0 — Detect

Identify stacks, layout, test runners, task runners, CI, and whether coverage is already measurable. Report that block before changing anything.

## Phase 1 — Command interface

The tool is the repository's (Make, just, package scripts). The interface names are fixed:

- `check` — lint, typecheck, and tests for the whole repo.
- `check-<capability>` — the same, scoped to one capability. This is the per-chunk command.
- `golden` — reference-value tests that read `specs/<capability>/tables/`.
- `mutation-<capability>` — pinned differential mutation for one eligible target, with structured coverage and survivor output. Add it when a mutation engine exists or the human asks to install one.
- `fuzz-<capability>` — property or fuzz targets. The command may report N/A when no target applies.

Declare the commands that exist in the root `AGENTS.md` under `## Commands`. If that file is missing, create a short one: authority order, pointers to `specs/`, these commands, and a note that run state lives in `.agent-runs/`. Do not create a second operational authority under a harness directory.

Ensure `.agent-runs/` is gitignored.

## Phase 2 — Metric classes

Each class below needs a living instance, or an explicit N/A in the report when the stack has no equivalent. A silent absence is a named blocker.

- Lint and typecheck.
- Tests with line and branch coverage. The eligible mutation target must be measurable on its own.
- Mutation testing, version-pinned, when the human accepts the install. Otherwise name `MUTATION_TOOLING_REQUIRED` and leave the command reporting that blocker.
- Property or fuzz testing where parsers, validators, or state machines exist.
- Complexity or duplication checks when a pinned tool exists. Absence is a named blocker for the hardening workflow, recorded in the report.
- Race detection where the stack offers it. N/A elsewhere.
- Secrets scan, blocking from the first run. A true finding is rotated, not grandfathered.
- Security static analysis for the stack.
- Build.
- Browser end-to-end for a UI stack, one scenario per UI-facing acceptance criterion. N/A for a pure backend.

Install pinned tools when the environment allows. If it forbids installs, leave the config and a named blocker that states the exact command to run.

## Phase 3 — Golden harness

Add a data-driven test that discovers `specs/*/tables/*` (CSV or JSON), asserts input to expected output row by row, and names each case by its stable requirement ID. With no spec yet, wire one example table clearly marked as an example so `golden` runs green, and document that the first real `to-spec` output replaces it.

Document a sabotage check: change one reference value and expect `golden` to fail. Run it once if the harness is real, then restore the value. Record the output.

## Phase 4 — CI

Create or extend the existing workflow. Keep lint, typecheck, tests with coverage, build, `golden`, and the secrets scan as separately visible checks. Wire differential mutation only for affected capabilities when the mutation command exists.

## Phase 4b — Spec approval (optional)

Only for a GitHub repository with Actions. Ask the human whether to install `/approve` spec approval. Use the host's structured question tool when it exists (in Claude Code, `AskUserQuestion`), with "Install" as the recommended option and the limitations below in the description. Install only on an explicit yes. On a no, record "spec approval: declined" in the report and move on.

What it is: a reviewer comments `/approve` on the spec's pull request; a workflow fills `approved_by` (login) and `approved_at` (comment time, UTC) in the front matter of every changed `specs/*/*.md` that has a `capability_id`, commits as the Actions bot, and replies with the reviewed head SHA. `status` stays `draft`; ratification is still the merge. A sibling check fails the pull request when a spec changes after its approval.

Install:

- Copy this plugin's `templates/spec-approval/workflows/*.yml` to `.github/workflows/` and `templates/spec-approval/scripts/spec_aprovacao.py` to `.github/scripts/`. Never overwrite an existing file; report the conflict and stop that step.
- Keep the workflow's `actions/checkout` and `actions/setup-*` major versions aligned with the repository's existing workflows.
- Verify: `python3 -m py_compile .github/scripts/spec_aprovacao.py`, and `actionlint` when available (the `rhysd/actionlint` image works without an install).
- Declare it in the root `AGENTS.md` under `## Commands`: "Spec approval: comment `/approve` on the spec's pull request."

Tell the human these limits before they answer, and repeat them in the report:

- `issue_comment` workflows run only from the default branch's copy, so `/approve` works after the install is merged.
- The approver's "Viewed" file state is not readable with `GITHUB_TOKEN` (`viewerViewedState` is the token owner's). The substitute: the commenter needs write permission, and the approval is refused when the head moved after the comment.
- The guard check blocks merges only when branch protection marks it required; private repositories on the free plan cannot.
- The approval commit is pushed with `GITHUB_TOKEN`, so it does not start CI on its own.
- No self-approval rule, and it guards against mistakes, not against someone with write access forging the bot's commit.

## Phase 5 — Ratchet baseline

If a metrics baseline file is absent, measure current lint and security-analysis counts and write `.metrics-baseline.json` as the ratchet floor: new issues fail, the existing count is the ceiling until a shrink-and-lock step lowers it. Do not edit an existing baseline in this skill.

## Upstream kernel

This plugin does not vendor `scripts/spec-anchored`. When the repository wants mechanical scope validation and approval fingerprints, install the MIT bundle from `https://github.com/w00fx/spec-anchored-agentic-development` into the repo (`scripts/`, `policy/`, `tests/` as that repository documents). Until then, implement adapters hash the canonical approval JSON locally and record the command.

Copy this plugin's `templates/constitution.md` to `architecture/constitution.md` only when that file is missing. Copy `templates/capability-context.md` only when the human names a capability that has a spec and no nearby context pointer.

## Report

List what was detected, what was added, what was left alone, commands actually run and their results, whether spec approval was installed or declined, and every named blocker.
