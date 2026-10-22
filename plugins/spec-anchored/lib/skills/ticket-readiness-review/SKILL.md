---
name: ticket-readiness-review
description: Review a proposed issue or issue batch before publication or dispatch. Checks that each issue is one coherent delivery contract. Report only. Does not edit tickets, plans, or code.
---

# Ticket readiness review

Review the ticket contracts and, when present, the whole proposed set. Do not review an implementation plan or code. Do not edit the tickets.

Classify every finding as `[BLOCKER]`, `[SHOULD]`, or `[NIT]`, with evidence and a concrete correction.

Three questions:

- Could a fresh worker execute this task without inventing semantics, scope, dependencies, evidence, or permissions?
- Is this issue one coherent delivery task, rather than a requirement, component, test, specialist pass, or implementation step promoted into the tracker?
- Does the set keep coordination cheap without gluing together outcomes that could be accepted independently?

## Per ticket

1. Effective spec and complete stable IDs. A missing, unknown, or recreated normative reference is `[BLOCKER]`.
2. The problem is a claim about current behavior. The worker may reach `NO_CHANGE_REQUIRED`. A demanded patch that ignores current behavior is `[BLOCKER]`.
3. One primary outcome. No useful outcome means merge it into the task that completes it. Several independently acceptable outcomes means split at those boundaries. Supporting failures, evidence, and hardening for the same outcome stay inside the task. Expand umbrella labels (`platform foundation`, `safe lifecycle`) into concrete capabilities. If a reviewer could accept one and reject another, split.
4. Several requirements, layers, and test types may belong together when they produce the same outcome.
5. Schemas, adapters, tests, mutation hardening, observability, and cleanup required for that outcome stay inside the issue unless they have their own delivery boundary.
6. Scope and non-goals are explicit. A missing high-risk exclusion is `[BLOCKER]`.
7. Every verified ID has a credible method. Missing evidence for unattended work is `[BLOCKER]`.
8. Rollout, rollback, external effects, migration, and approval are stated when they apply.
9. Blockers are explicit, real, acyclic, and use the repository's issue links. Do not invent hidden edges.

## Granularity blockers

Report `[BLOCKER]` unless an independent boundary is demonstrated:

- one issue per `BR-*` or `AC-*`;
- a layer or component ticket;
- a tests-only ticket;
- a specialist-pass ticket (mutation, QA, cleanup, review);
- a foundation whose only consumer is the next issue;
- serial shards of one outcome;
- temporary plumbing the next issue replaces;
- a container issue that only groups other issues;
- duplicate outcomes;
- an umbrella title hiding independent acceptance or rollback boundaries.

A retained split needs at least one of: independent acceptance, independent rollback, different approval authority, an independent migration or experiment lifecycle, operationally disjoint scope, independent reviewer judgment, or a reusable enabler with its own verification.
