---
name: review-spec-drift
description: Report drift between one capability spec and its implementation. Use on explicit invocation. Report only. Does not edit the spec or the code.
---

# review-spec-drift

For the capability in the argument, or the one in the current session when the argument is empty:

1. Read `specs/<capability>/` including the entrypoint and companion files.
2. Read `specs/<capability>/contracts/` when that directory exists.
3. Read the implementation that belongs to that capability.
4. Compare behavior, not file layout.

Report discrepancies in three bands:

- Critical drift — the spec requires a behavior the code does not implement, or the code does something a non-goal forbids. This blocks treating the capability as conformant.
- Relevant drift — behavior the code has that the spec does not anticipate, or a contract schema that disagrees with the code. Fix in the next planned change.
- Cosmetic drift — wording or naming that does not change behavior. Update the spec when a human next touches it.

Do not fix anything. Name the spec path, the spec commit when git can show it, and the files that evidence each item. A missing spec is the finding. Do not invent the missing rules.
