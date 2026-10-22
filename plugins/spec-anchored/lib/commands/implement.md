---
name: implement
argument-hint: issue or spec slice
description: Supervised spec-anchored implementation of one issue or spec slice. Human gates stay in session.
---

Follow the `implement` skill in this plugin in full. That skill loads `implement-feature` and the shared implementation protocol.

One slice. Typed branch. Human approves the plan fingerprint before code. Stop at `PR_READY_AWAITING_HUMAN`. Do not merge.
