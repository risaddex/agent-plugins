---
name: shape
description: Interview toward a capability spec or a sharpened task. Use only when the user invokes shape or asks to grill an idea, transcript, brownfield area, existing spec, or issue. Never write or edit the spec file.
---

# shape

Identify the target and pick one mode:

- An idea or ongoing discussion → interview toward a capability spec. `to-spec` writes the file.
- A transcript → extract what was decided, then interrogate the gaps.
- Existing code with no spec → read what the code does, then ask what it should do.
- An existing spec → grill the document for ambiguity and holes. `to-spec` applies the refinements.
- A task or issue → sharpen it until an agent could implement it without guessing.

Stop when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Write no implementation code. Write or edit no spec file.

## Interview mechanics

Map the interview as a design tree and work it in rounds. The frontier is every question whose prerequisites are already settled. Ask the whole frontier in one round, numbered. Wait. A question that depends on an open answer in this round waits for the next round.

Each question includes a recommended answer. The human confirms or corrects. The recommendation is a proposal. The human's answer is the truth.

If the codebase can answer a question, explore it and do not block the rest of the frontier on that exploration. Code settles facts. Behavior found in code enters as a question until the human confirms it. Code can contain bugs that became structure.

For a calculation or threshold, collect input → expected-output pairs with the human first, then draft the rule as the generalization of those examples.

Stay inside one capability. A crossed boundary is architecture. Stop and say so.

## While the session runs

- When a term conflicts with the existing glossary, say so in the same turn.
- When a term is vague, propose one canonical term and name the synonyms to avoid.
- Stress-test relationships with concrete scenarios as the concepts appear, including empty, duplicate, concurrent, and out-of-order cases.
- When the human states how something works, check the code and surface the contradiction.

Walk purpose and capability language, business rules (EARS by default; an external rule cites identifier, version, and scope), Given/When/Then criteria, edge cases, non-goals an implementer would otherwise build, and contracts with neighbors. An acceptance criterion asserts the journey's end state. "An email sends" is not a criterion. "The link opens the right thread" is.

## Running state

Keep the summary in the conversation until `to-spec` writes the file.

- Terms, in this shape: **Invoice**: what it IS, one or two sentences. _Avoid_: bill, payment request. No implementation detail.
- Rules, in EARS, as agreed.
- Reference rows, as collected.
- An ADR at `architecture/decisions/YYYY-MM-DD-slug.md` only when the decision is hard to reverse, surprising without context, and the result of a real trade-off. One title plus context, decision, and why. Create the directory on the first ADR.

## Grill-back

Before handoff, probe the summary:

- Could two implementations that differ in business behavior both be defended? Tighten that sentence. Technical diversity under the same behavior is freedom.
- Do zero, negative, enormous, duplicate, concurrent, and out-of-order inputs have a rule or an explicit non-goal?
- Does every rule have an executable expression (reference values or Given/When/Then) or an explicit human-judgment mark?
- If the external source versions tomorrow, can every impacted rule be found by its citation?

## Output

Spec modes end with the running summary organized by template section, plus any open questions. Then hand off: invoke `to-spec`. Unresolved ambiguity stays an open question.

Task mode ends with paste-ready issue text: title, context, binary acceptance criteria pointing at spec IDs, edge cases, and out of scope.

The human is the source of business truth. This skill structures the interview. Nothing is invented on the way.
