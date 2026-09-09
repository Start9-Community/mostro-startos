# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **PRs target `Start9-Community/mostro-startos`, not its parent `MostroP2P/mostro-startos`.** CI, the registry release and `manifest.packageRepo` all name the community fork, but GitHub's Contribute button proposes the parent. The parent fast-forwards from community after a merge; never "Sync fork" the community repo, which would take the parent's `master` in unreviewed.
- **Relay URLs are validated in the handler as well as the form.** `List.text` `patterns` are enforced by the UI only; a programmatic submit bypasses them and a bad relay reaches the config.
- **Import LND's host id and port from `lnd-startos/startos/interfaces`** rather than hardcoding, so a change on LND's side is a compile error here.
- **The LND mount is idmapped `0 → 1000`** so `mostrouser` can read credentials LND wrote as root, straight off the read-only mount. Don't replace it with a copy step — a copy goes stale when LND rotates its cert.
- **The dependency requires LND's `sync-progress` check, not just `running`.** Mostro settles hold invoices; an unsynced node cannot do that safely.
