---
name: implement-orchestrated
description: One orchestrator-owned issue, worktree, and pull request. Use only as the worker's explicit first instruction. Gates are mediated through the issue. Never starts from a casual mention.
---

# implement-orchestrated

First action: read and follow the `implementation-protocol` skill in full. The parent worker is the Owner. The orchestrator schedules and monitors. It does not author the code and it does not integrate a subagent commit on its own.

Invocation shape:

```text
implement-orchestrated issue #<N> --mode assisted|autonomous
```

The issue pins the effective spec and the stable IDs. The mode is launcher policy. Do not infer it from prose. One issue, one worktree, at most one pull request.

## Gate providers

| Protocol need | assisted | autonomous |
|---|---|---|
| Ambiguity | Comment the question and the evidence, label the issue, release the claim, `NAMED_BLOCKER` | Same |
| Plan | Post the plan and the exact `APPROVAL-FINGERPRINT`. Edit nothing until a human replies `approved <fingerprint>` | Proceed only when the qualified ticket, effective spec, and issued policy already determine the plan. Any load-bearing decision blocks |
| Spec change | `SPEC_CHANGE_REQUIRED`. Proposal only. Release the claim | Same |
| Scope, dependency, schema, data, or external-action expansion | Blocker | Blocker |
| Phase 7 | `general-code-reviewer` in an isolated worktree. Owner inspects before integration | Same |
| Phase 8 | `mutation-hardener` in a fresh isolated worktree. Owner inspects before integration | Same |
| External reviews | After the pull request, outside this run | Same |
| Delivery | Open the pull request, post the URL and the terminal, stop. `PR_READY_AWAITING_HUMAN` | Same |

Record input SHA, output SHA, changed paths, commands, and the Owner disposition for both internal agents. Reject any truth, scope, gate, or permission change. An Owner correction after mutation hardening reruns Phases 7 and 8.

If the host has no isolated worktree, stop with `ENVIRONMENT`.
