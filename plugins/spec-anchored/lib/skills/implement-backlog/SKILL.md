---
name: implement-backlog
description: Unattended implementation of one qualified increment issue. Use only as an explicit launcher instruction. Every question becomes a named blocker. Never use for a new capability or for architecture.
---

# implement-backlog

First action: read and follow the `implementation-protocol` skill in full. Nobody answers mid-run. The parent worker is the Owner and inspects every returned diff before integrating it.

One qualified issue. One worktree. At most one pull request. New capabilities, semantic invention, broad architecture, and truth or oracle changes are out of scope. The narrow start is an allowlist of trivial classes, green CI, and a human merging every pull request.

## Gate providers

| Protocol need | Provider |
|---|---|
| Ambiguity or load-bearing decision | `NAMED_BLOCKER` with the question and the evidence. Never guess |
| Plan | The Owner writes a plan only when the qualified ticket, the effective spec, the issued policy, and a deterministic oracle already determine it. Any unpinned decision aborts |
| Spec change | `SPEC_CHANGE_REQUIRED`. Comment a proposal. Do not edit semantics |
| Scope, dependency, schema, data, or external-action expansion | Blocker |
| Phase 7 | `general-code-reviewer`. Owner records the inspection before integrating |
| Phase 8 | `mutation-hardener`. The 100% eligible-target contract stands. Owner records the inspection |
| External reviews | Outside this run |
| Delivery | Open the pull request, post the link and the outcome, stop at `PR_READY_AWAITING_HUMAN`. Do not watch the pull request and do not claim the merge |

If either authoring agent returns a decision the unattended policy cannot authorize, abort upstream. A subagent commit is never integrated without a recorded Owner inspection.

One issue per run. Release the claim on any blocker. The same failure three times is `REPEATED_FAILURE`. Preserve commands, outputs, handoffs, dispositions, and visible cost in `.agent-runs/<run-id>/`.

If the host cannot isolate a worktree, stop with `ENVIRONMENT`.
