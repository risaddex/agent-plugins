---
name: spec-to-tickets
description: Decompose one ratified capability spec into coherent delivery issues. Use only on explicit invocation. Drafts first, publishes only after the human confirms. Does not edit production code or the spec.
---

# spec-to-tickets

Convert one effective capability spec into a reviewed set of implementation issues. Inspect the repository. Do not modify production code or the spec.

If `status` is not `ratified` on the protected default branch, stop with `SPEC_NOT_EFFECTIVE`.

## Core law

One issue is one delivery task: the smallest coherent unit that produces one meaningful, independently demonstrable outcome and justifies one owner, one branch, at most one pull request, and one full implementation lifecycle.

```text
requirement ID        durable truth in the spec
issue / task          coherent delivery outcome
implementation step   work inside the task's plan
verification case     evidence proving the task
specialist pass       mutation, hardening, or review inside the task
```

One task may implement many stable IDs, cross layers, and contain several test types.

## Draft

Read the whole spec and its companion files. Record, on every task, the capability ID, spec path, spec commit, and the stable IDs it implements and verifies.

Inspect code, contracts, tests, and ADRs. Note what already exists, the missing outcomes, and any independent approval, rollout, rollback, migration, or operational boundary.

For each candidate, finish this sentence: "After this task, the system can <one observable capability>."

A valid candidate has one primary outcome, a useful state when done, one review story, mapped IDs, credible evidence, explicit non-goals, and a rollback or recovery boundary.

Keep work together when it serves the same outcome, including schema, domain logic, persistence, tests, and hardening. Split only when at least one independent boundary holds: each part is acceptable alone, rollback paths differ, approval authorities differ, a migration or experiment must finish alone, scopes are safe to run in parallel, reviewers must judge independently, or one part is a reusable enabler with its own verification. Record the boundary for every split.

These splits are blockers unless that boundary is demonstrated: one issue per requirement ID, a layer or component ticket, a tests-only ticket, a specialist-pass ticket, a foundation with a single consumer, serial shards of one outcome, temporary plumbing the next issue replaces, a wave container, a duplicate outcome, or an umbrella title that hides independently acceptable capabilities.

## Review, then publish

Run the `ticket-readiness-review` skill on the draft set. Show the human the reconciliation (milestone or checkpoint, proposed task, kept or split or merged, and why) and the findings.

Publish or update issues only after the human confirms the batch. Each published issue carries capability, spec path, spec commit, stable IDs, one primary outcome, non-goals, evidence method, dependencies, and rollback. Blocking edges are explicit and acyclic.
