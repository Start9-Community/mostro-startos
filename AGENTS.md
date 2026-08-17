# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Relay URLs are validated in the handler as well as the form.** `List.text` `patterns` are enforced by the UI only; a programmatic submit bypasses them and a bad relay reaches the config.
- **Import LND's host id and port from `lnd-startos/startos/interfaces`** rather than hardcoding, so a change on LND's side is a compile error here.
- **The LND mount is idmapped `0 → 1000`** so `mostrouser` can read credentials LND wrote as root, straight off the read-only mount. Don't replace it with a copy step — a copy goes stale when LND rotates its cert.
- **The dependency requires LND's `sync-progress` check, not just `running`.** Mostro settles hold invoices; an unsynced node cannot do that safely.
