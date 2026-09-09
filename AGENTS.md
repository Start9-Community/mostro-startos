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

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical
reference for an AI support or administering agent) and `instructions.md`
(end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in `NOTES.md` or `PLAN.md`. What you verified, tried, and decided
belongs in the commit message and the PR body.

## This repo

- **Remotes: `origin` is MostroP2P (team); `upstream` is Start9-Community (PRs and registry).** After clone: `git remote add upstream https://github.com/Start9-Community/mostro-startos.git`. Push only to `origin`. Disable accidental pushes with `git remote set-url --push upstream DISABLE`.
- **Ship packaging as a PR into Start9-Community, not only into MostroP2P.** Base repo `Start9-Community/mostro-startos`, base `master`, head `MostroP2P:<branch>`. GitHub's default Contribute button on this repo points the wrong way.
- **After Start9 merges, fast-forward this repo from community.** `git fetch upstream && git merge --ff-only upstream/master` on `master` (same for `next`). Do not use GitHub "Sync fork" on Start9-Community — that would pull this parent into community without a PR.
- **Relay URLs are validated in the handler as well as the form.** `List.text` `patterns` are enforced by the UI only; a programmatic submit bypasses them and a bad relay reaches the config.
- **Import LND's host id and port from `lnd-startos/startos/interfaces`** rather than hardcoding, so a change on LND's side is a compile error here.
- **The LND mount is idmapped `0 → 1000`** so `mostrouser` can read credentials LND wrote as root, straight off the read-only mount. Don't replace it with a copy step — a copy goes stale when LND rotates its cert.
- **The dependency requires LND's `sync-progress` check, not just `running`.** Mostro settles hold invoices; an unsynced node cannot do that safely.
