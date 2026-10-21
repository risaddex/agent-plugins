---
name: implement-feature
description: Supervised implementation of one issue or spec slice. Use only when the user explicitly invokes implement or implement-feature. Human gates in session. Does not run headless.
---

# implement-feature

First action: read and follow the `implementation-protocol` skill in full. This adapter only names who satisfies each gate. The human is in the session. The parent agent is the Owner.

One issue or one spec slice. One typed branch. At most one pull request. Do not choose orchestrated or unattended mode unless the user invoked that mode.

## Gate providers

| Protocol need | Provider |
|---|---|
| Ambiguity or unauthorized assumption | Human in session, after repository research. Numbered options and one recommendation |
| Plan, scope, evidence, mutation and fuzz applicability | Human approval of the exact `APPROVAL-FINGERPRINT` |
| Semantic spec amendment | Human in session: affected IDs, old meaning, proposed meaning, rationale, verification delta. The pull request merge ratifies it |
| Scope, dependency, schema, data, or external-action expansion | Human approval of a new scope and a new fingerprint |
| Phase 7 | `general-code-reviewer` in an isolated worktree. Owner inspects and accepts or rejects before integration |
| Phase 8 | `mutation-hardener` in a fresh isolated worktree. Owner inspects and accepts or rejects before integration |
| External specialized reviews | Outside this skill. Pull request, CI, or human |
| Delivery | Pull request opened. Terminal `PR_READY_AWAITING_HUMAN` |

## Call graph

```text
Owner implementation
→ deterministic baseline
→ general-code-reviewer
→ Owner diff review and integration
→ mutation-hardener
→ Owner diff review and integration
→ final deterministic verification
→ pull request
```

For `NO_CHANGE_CANDIDATE`, dispatch `general-code-reviewer` in no-change mode. Do not call `mutation-hardener` when there is no eligible code target.

Both internal agents inherit this session's model at maximum effort. If that cannot be honored or observed, block. Verification commands come from the repository interface (`check`, `check-<capability>`, `golden`, and the mutation or fuzz commands when present) and from `rules/testing.mdc`.

After delivery, offer `explain` when the human wants the walkthrough.
