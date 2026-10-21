---
name: explain
description: After a spec-anchored change, write a self-contained walkthrough of what was built and why. Use on explicit invocation. Reads the spec, the approved plan, and the diff. Does not invent intent from the code.
---

# explain

Write a walkthrough of the change in the argument. Default to the work just finished in this session. A diff, branch, or pull request is valid when named.

Read before writing:

- the diff;
- the capability spec;
- the approved plan from protocol Phase 3;
- the ambiguity resolutions and the lessons from Phase 6;
- the constitution, when the change touches a domain rule.

When the work is from another session, take the plan from the pull request description or from `.agent-runs/<run-id>/`. If an intent artifact is missing, say which section lacks it. Do not reconstruct intent from the code and present it as the plan.

Explain why and how the pieces connect. Skip a paragraph that only restates the code. For a state machine or a permission flow, cover trigger, rule, state change, execution path including failure, and edge cases, each with an evidence link.

Write `docs/walkthroughs/<YYYY-MM-DD>-<slug>.html` as one self-contained file: inline CSS and JS, no external assets, a table of contents, and callout boxes for invariants. Sections, in order. Omit one only by saying it does not apply:

1. Background of the surrounding system, from the code, heavier when the reader was not in the session.
2. What this change does, against the spec, in two to four paragraphs.
3. The core intuition, with one toy example walked start to finish.
4. Where it lives: capabilities, modules, files, and where the change begins and ends.
5. Execution flow: entry point, call chain, order.
6. External connections: database transactions, APIs, queues, and what happens when each is unavailable.
7. Events: who emits, who consumes, ordering, and a missing or out-of-order event.
8. Data: models, schemas, transformations, contracts with neighbors.
9. Domain rules, each with its stable ID and normative citation when one exists, and where in the code it lives.
10. Error handling: every failure path, recovery, idempotency, retries, and what the caller sees.
11. Edge cases handled, and the ones the spec marks out of scope.
12. What the tests verify: each acceptance criterion and the test that proves it. Say where a green suite still does not prove production behavior.
13. Decisions and why: option chosen, alternatives, tradeoff. Pull this from the plan and Phase 2, not from the diff.
14. Watch-outs: known debt and low-confidence decisions, with the trigger that should reopen them.
15. Quiz: 5 to 8 multiple-choice questions on the why and the flow. Each option reveals why it is right or wrong. No trivia.

Close with one line: the reader can ask, in session, to be grilled on whatever the quiz missed.
