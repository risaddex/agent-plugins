---
name: to-spec
description: Write or update a capability spec from a completed shape interview or supplied notes. Use only on explicit invocation. Does not interview. Gaps become open questions. Stable IDs are issued in continuation and never renumbered.
---

# to-spec

Turn the material already in the conversation into the capability spec. A `shape` session is the common case. Notes or a transcript work too.

This skill does not interview. If a template section lacks material, list it under Open questions. Ask nothing. Invent nothing. Default nothing.

## Write

1. Identify the capability from the argument or the session subject.
2. Use this plugin's `templates/capability-spec.md` as the shape of `specs/<capability>/<capability>.md`. One entrypoint. Companion files may be declared later. They do not become a second authority.
3. Create mode, when no spec exists: fill every section from the resolved material. Capability language is an opinionated glossary (canonical term, `_Avoid_` synonyms, what it IS). Normative behavior uses the representation the truth type needs, EARS by default. An externally sourced rule cites identifier, version, and scope. Acceptance criteria are Given/When/Then, each with a typed stable ID. Calculations get reference-value rows. Non-goals have teeth. Contracts name neighbors.
4. Update mode, when the spec exists: add the delta. New items receive the next unused ID. Never renumber or rewrite an existing criterion unless the interview explicitly changed that criterion. Retire an ID that no longer applies. Do not delete it.
5. A reference table larger than a screen goes to `specs/<capability>/tables/` as data the golden tests read. The rule cites the file.

Set `status: draft`. Promotion to `ratified` happens when a human merges this spec's own pull request to the protected branch. Downstream ticket and implement skills refuse a draft.

## Completeness

- Every template section is filled or represented under Open questions.
- Every rule has an executable expression, or is marked human-judgment territory.
- Every externally sourced rule carries its citation.
- The spec stays layer-agnostic: behavior and business truth. Deployment targets, framework names, and source paths stay out. The how lives in plans and ADRs.

## Output

Report the path, the IDs added (for example `BR-PAY-013..015`, `AC-PAY-016..017`), and the open questions. The human owns the truth, including the reference values, and commits the spec alone before any implementation issue references it. Then invoke `spec-to-tickets` only after the human asks, or after the spec is ratified when they want tickets next.
