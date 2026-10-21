# Constitution

<!-- 15 to 30 lines. Non-negotiables only. A rule whose violation is expensive enough to be an incident belongs here, and later in a deterministic check. Replace every placeholder before ratifying. -->

1. Sensitive quantities use a decimal type. Floating point is not a representation for them.
2. Every critical decision is traceable to the rule applied, the input, and the code version.
3. A rule taken from an external source cites that source: identifier, version, and scope.
4. A rule for a closed period does not change retroactively.
5. A spec change is a business-rule change and waits for human approval.
6. The first no comes from the machine: tests, types, and lint fail before a human is asked to read the diff.
7. A new capability or a new boundary stays a human decision.
8. A run ends when the pull request is ready for a human. The merge is that human's act.
9. Typed requirement IDs are retired. They are never renumbered or reused.
10. Done means the runner's output is recorded with the change.

Add the domain lines that, if broken, cost real money. Delete a line that is only a preference.
