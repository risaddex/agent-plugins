---
name: general-code-review
description: Rubric for the internal authoring general-code-reviewer. Use on one exact Owner candidate to fix concrete correctness, simplicity, local design, test, and type defects before mutation hardening. This pass is hardening, not approval.
---

# General code review

Apply this inside the `general-code-reviewer` agent. Review one exact candidate, fix concrete defects inside the approved scope, verify, and inspect again. The commit is a proposal. The Owner decides whether it lands. This skill does not approve the work.

Spec conformance, security, performance, compliance, and systemic architecture stay outside. Surface a concrete indicator when you see one. Do not claim those reviews happened.

## Inputs

Require the exact input SHA, the complete diff, the task outcome, the approved plan and scope, the loaded rules, the verification commands, and known baseline failures. Refuse a moving or unidentified candidate with `CODE_HARDENING_BLOCKED`.

Load `rules/truth-layer.mdc` and `rules/testing.mdc` before editing.

## Correctness

Trace the happy path and the material failures: empty, single, large, zero, negative, first, last, overflow, absent; error propagation, partial failure, cleanup, retries, cancellation, timeout; duplicates, ordering, idempotency, races, non-atomic transitions; caller compatibility and contract drift; behavior outside the touched lines that this change can regress.

Fix reproducible defects. Add permanent regression coverage at the boundary where the defect occurs.

## Simplicity

Remove needless complexity inside the task: duplicated mechanisms the repository already has, dead code, speculative abstractions, mixed responsibilities, framework or IO leaking into business logic, and a new technical-layer or entity folder. A smell alone does not justify unrelated cleanup. Fix it when it creates a concrete correctness, testability, or coupling problem in the approved change.

## Tests

Follow `rules/testing.mdc`. Tests prove observable behavior and relevant boundaries, use the lowest faithful boundary, stay deterministic, and would fail if the intended behavior regressed. They do not weaken a golden oracle and they do not merely mirror the implementation. Language mutation belongs to `mutation-hardener`.

## Types

Prefer representations that make invalid states difficult: parse untrusted values into types that carry guarantees, model alternatives explicitly, keep nullability and precision clear, and make matches exhaustive where the language allows it.

## Commit

One local handoff commit. In-scope hardening only. Message states what and why. The tracked tree is clean after verification. The Owner can inspect one exact `input_sha..output_sha` diff.

## Loop

```text
inspect exact candidate
→ evidence-backed findings
→ fix in scope
→ run affected checks
→ inspect again
```

Repeat while progress is measurable. Stop when a fix needs semantic, scope, dependency, oracle, privilege, or external-action authority. A `BLOCKER` needs a counterexample, a failing required command, an unambiguous rule violation, a concrete data or security risk, or missing required evidence.

Every applied change appears in the handoff with path, summary, reason, behavioral impact, and verification.
