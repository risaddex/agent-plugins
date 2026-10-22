---
name: implementation-protocol
description: Shared spec-anchored state machine, phases 0-10. Load when an implement adapter says to. Does not start a run by itself.
---

# Implementation protocol

Every implement adapter (`implement-feature`, `implement-orchestrated`, `implement-backlog`) runs this machine. The adapter names who satisfies each gate. This file defines the work.

The parent agent is the **Owner**. It alone owns the branch, the terminal, and the decision to integrate a commit returned by an internal agent.

Two internal authoring agents, and only these two:

```text
general-code-reviewer
mutation-hardener
```

Both inherit the Owner's effective model. Ask the runtime for maximum effort. If maximum effort cannot be honored or observed, stop with `NAMED_BLOCKER` / `ENVIRONMENT`. Do not switch models and do not accept a downgrade.

Spec conformance, security, performance, compliance, and systemic architecture reviews stay outside this protocol. They run on the pull request, in CI, or with a human.

## Terminals

A run ends as exactly one of:

- `PR_READY_AWAITING_HUMAN` — pull request open, required checks green, no blocker, every acceptance criterion tied to a real command output in the run log. The merge is a separate human act.
- `NAMED_BLOCKER` — abort with a typed cause. Legitimate causes include `AMBIGUITY`, `MISSING_ORACLE`, `TRUTH_CONFLICT`, `SCOPE_VIOLATION`, `SPEC_CHANGE_REQUIRED`, `SPEC_STALE`, `SPEC_NOT_EFFECTIVE`, `GRAPH_DECISION_REQUIRED`, `ENVIRONMENT`, `REPEATED_FAILURE`, `CODE_HARDENING_BLOCKED`, `MUTATION_TOOLING_REQUIRED`.
- `NO_CHANGE_REQUIRED` — verification proved the requested behavior already exists, and `general-code-reviewer` corroborated that evidence in no-change mode. Never self-declared.

A run never reports merged, deployed, or production-validated.

## Phase 0 — Preflight

Read the adapter's gate table. Confirm the spec is ratified on the protected default branch, which is the effective truth. If a ticket pins a spec revision, compare by requirement meaning:

- no pointed ID, source, or non-goal changed → note `SPEC_REBASED_NO_RELEVANT_CHANGE` and continue;
- a pointed requirement, contract, or non-goal changed → `SPEC_STALE`;
- relevance cannot be established → blocker for the configured authority.

Confirm repository, branch or worktree, base SHA, issue ownership, available commands, and pre-existing failures. Read the root `AGENTS.md` when it exists. Load `lib/rules/truth-layer.md` for any versioned change, `lib/rules/testing.md` for behavioral changes, and `lib/rules/package-by-feature.md` when production files or capability boundaries move. Record the loaded rule paths.

Create `.agent-runs/<run-id>/`. Run state, logs, approvals, and handoffs live there. They never live under `.cursor/`, `.claude/`, or `.codex/`. Leave unowned user changes untouched.

## Phase 1 — Proven delta

Before any plan, write:

```text
expected
observed
evidence   # command plus real output
gap
classification
```

Classification is one of `ALREADY_SATISFIED`, `STALE_REQUEST`, `WRONG_SYSTEM`, `UNVERIFIABLE`, or a real gap. No gap is `NO_CHANGE_CANDIDATE`, not a cosmetic patch. Route that evidence target to `general-code-reviewer` in no-change mode during Phase 7. Only a corroborated target becomes `NO_CHANGE_REQUIRED`. Mutation hardening does not apply to a true no-change target.

## Phase 2 — Understand and resolve ambiguity

Read the root context, the capability context, the relevant spec, the issue, and the current code and tests. Separate facts, authorized decisions, reversible details, and unauthorized assumptions.

Material ambiguity goes to the adapter's provider, with proposed interpretations and a recommendation. An aborting provider returns `NAMED_BLOCKER` / `AMBIGUITY`. Guessing is not a resolution. Code settles facts. Code does not settle intent.

## Phase 3 — Plan, scope, and approval

The plan names:

- pointed requirement IDs and the single primary outcome;
- load-bearing decisions, and the reversible details left for implementation;
- steps and dependencies;
- expected paths and allowed operations;
- dependency, schema, data, and external-effect permissions;
- the evidence method for every acceptance criterion;
- mutation eligibility and whether property or fuzz testing applies;
- rollback or recovery, and explicit non-goals.

Scope is the intersection of the ticket, the externally issued policy, and the paths the plan proposes. Expansion is a new proposal and a new approval.

Build an approval bundle as canonical JSON with sorted keys:

```json
{
  "base_sha": "<sha>",
  "plan_hash": "<sha256 of the plan text>",
  "policy_id": "<issued profile id or supervised-local-v1>",
  "scope_paths": ["<path>"],
  "semantic_amendment_hash": null,
  "spec_entrypoint": "specs/<capability>/<capability>.md",
  "spec_pin": "<commit or ratified>",
  "ticket_hash": "<sha256 of ticket identity and body>"
}
```

If `scripts/spec-anchored` is installed, use its approval fingerprint. Otherwise hash the canonical JSON with a local SHA-256 command and record the command plus the digest as `APPROVAL-FINGERPRINT`. Any change to those inputs requires a new fingerprint and a new approval. The run carries the approval and does not mint a wider one.

## Phase 4 — Owner implementation

Work the approved plan on a typed branch, in reviewable chunks. On every chunk, run lint, type check, and the tests for the touched area. Red does not advance.

Use the repository's declared commands. Tests derive from requirement IDs and `lib/rules/testing.md`. The truth layer stays read-only unless the adapter's semantic-amendment gate already approved the edit.

A new path, dependency, schema or data operation, privilege, external action, or load-bearing decision returns to the adapter's gate.

## Phase 5 — Baseline deterministic verification

Run the approved evidence profile before either internal agent: focused and required tests, lint, typecheck, build, contract checks, golden or reference oracles, and property or fuzz tests when declared. Record exact commands, exit codes, relevant output, unexecuted checks, and whether each failure is baseline or regression. Required gates stay green.

## Phase 6 — Durable synchronization

Update docs and evidence mappings that the approved scope includes. A semantic truth change goes back to the human gate and invalidates the fingerprint. Context or rule additions are proposals unless the approved scope includes them. A lesson that must survive becomes a versioned line in the same change.

## Phase 7 — General code review-and-repair

Dispatch `general-code-reviewer` against one exact Owner candidate SHA, in a disposable worktree. It may edit production and tests inside scope. It commits locally and returns input SHA, output SHA, every changed path, reason, behavioral impact, commands, results, and residual risks.

If the host cannot isolate a worktree, stop with `ENVIRONMENT`. Do not let the reviewer edit the Owner's tree in place.

For a no-change evidence target, the reviewer makes no edits and returns `NO_CHANGE_CORROBORATED` or the counterexample.

Subagent changes never land automatically. The Owner:

1. inspects the exact input..output diff;
2. checks semantic intent, scope, and non-goals;
3. accepts or rejects every material change;
4. integrates only the accepted local commit;
5. reruns the affected deterministic checks;
6. records the handoff and the disposition under `.agent-runs/<run-id>/`.

`SEMANTIC_CHANGE_REQUIRED`, `SCOPE_EXPANSION_REQUIRED`, `ORACLE_REVIEW_REQUIRED`, or `DEPENDENCY_APPROVAL_REQUIRED` returns to the matching gate. A loop that stops making progress becomes `NAMED_BLOCKER`.

## Phase 8 — Mutation hardening

On the Owner-accepted candidate, dispatch `mutation-hardener` in a fresh isolated worktree. It raises eligible-target line and branch coverage to 100%, runs differential mutation target by target, and stops at zero actionable survivors. It may not change truth, oracles, scope, thresholds, exclusions, rules, policy, or CI to make the gate pass.

The Owner repeats the six-step inspection from Phase 7. Equivalent or tooling-limited mutants need Owner review and later external review. Missing reproducible tooling is `MUTATION_TOOLING_REQUIRED`. Any Owner edit after accepting the hardener invalidates both internal passes and returns to Phase 7, then Phase 8.

Skip this phase only for a corroborated no-change target.

## Phase 9 — Freeze

Confirm both handoffs were inspected, neither agent changed truth or the judging gates, accepted commits are present, rejected changes are absent, the required deterministic suite is green on the integrated tree, and the mutation report names this candidate. Freeze base SHA, head SHA, and diff fingerprint. Any later versioned edit returns to Phase 7 and Phase 8.

## Phase 10 — Deliver

Open the pull request. Link the issue, the approval fingerprint, the verification evidence, both handoffs, and the Owner dispositions. Terminal: `PR_READY_AWAITING_HUMAN`. A later external blocker re-engages the Owner, and any code correction reruns Phases 5 through 9.

## Critical rules

Typed branch. Hooks stay enabled. Never merge. Never resolve your own semantic ambiguity. Never expand scope silently. Never edit truth or the judging gate to get green. Subagent commits are proposals until the Owner inspects them. Claims require the command output, not a narration.
