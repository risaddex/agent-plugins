<!--
Adapted from the MIT spec template in
https://github.com/w00fx/spec-anchored-agentic-development
(Raphael Moura). One durable contract per capability. This file is the
stable entrypoint. Sections are ordered by change rate. Document only
what the agent cannot infer. Stay layer-agnostic: behavior, not frameworks
or source paths.
-->

---
schema_version: 1
capability_id: CAP-<NAME>
status: draft
owner: <domain-owner>
approved_by:
approved_at:
provenance: <shape-session>
---

# Capability: <name>

## Purpose

<!-- One or two sentences: what this does for the business, and the one thing it must get right. -->

## Capability language

<!-- Opinionated glossary. What the term IS. Ban synonyms. Flag a term that means something else in another capability. -->

| Term | Meaning here | Avoid |
|------|--------------|-------|
| | | |

## Normative behavior

<!-- Each rule is a heading with a stable ID. Never renumber. Retire, do not delete. EARS is the default. A calculation is a formula plus the reference table. A lifecycle is a state model. A combination of conditions is a decision table. An external rule cites identifier, version, and scope. -->

### BR-<CAP>-001 — <name>

WHEN <trigger>, the system SHALL <observable behavior>.

> Source: <identifier + version + scope> (when the rule comes from outside)

## Acceptance criteria

<!-- Given / When / Then. Binary. Each criterion names the ID it verifies. A calculation anchors on reference values. -->

### AC-<CAP>-001 — <name> *(verifies BR-<CAP>-001)*

**Given** <state>, **When** <action>, **Then** <observable outcome with values>.

## Reference values

<!-- Input to expected output. Large tables move to specs/<capability>/tables/ and the rule cites the file. The human confirms every row. -->

| ID | Input | Expected |
|----|-------|----------|
| BR-<CAP>-001 | | |

## Non-goals

<!-- Something an implementer would otherwise build. -->

- This capability does not ...

## Contracts

<!-- What it receives and produces, and from whom. Failure sits next to success. An undeclared caller is denied. -->

- **Input:** <from which capability>
- **Output:** <to which capability>
- **Rejected:** <the failure sibling of the success output>

## Observability

- **Events:** what it emits on success and on rejection.
- **Metrics:** the one or two signals a human checks to see that real use is working.
- Instrumentation may be an acceptance criterion. A production outcome is a rollout signal, not a merge gate.

## Dependencies

-

## Open questions

<!-- open → resolved-by BR/AC/CTR → retired. An open question never disappears silently. -->

- **OQ-<CAP>-001 — <question>**
  - Why unresolved:
  - Decision needed from:
  - Blocks:
