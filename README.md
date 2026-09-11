<p align="center">
  <img src="icon.svg" alt="Mostro Logo" width="21%">
</p>

# Mostro on StartOS

> Everything not listed in this document should behave the same as upstream
> Mostro. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Mostro](https://github.com/MostroP2P/mostro) is a peer-to-peer Bitcoin exchange that runs over Nostr: buyers and sellers find each other through relays, and Mostro escrows the trade with Lightning hold invoices. This package runs your own Mostro instance against the LND on the same server.

- **Upstream repo:** <https://github.com/MostroP2P/mostro>
- **Wrapper repo:** <https://github.com/Start9-Community/mostro-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One upstream image, consumed unmodified.

| Property      | Value                                     |
| ------------- | ----------------------------------------- |
| Image         | `mostrop2p/mostro`                        |
| Architectures | x86_64, aarch64                           |
| Command       | The daemon, pointed at the data directory |

| Subcontainer | Purpose                                  |
| ------------ | ---------------------------------------- |
| `mostro-sub` | The only daemon — the one to `attach` to |

One oneshot runs first, giving the data directory to the daemon's user.

## Volume and Data Layout

One volume, plus a read-only view of LND's.

| Volume            | Mount Point | Purpose                              |
| ----------------- | ----------- | ------------------------------------ |
| `main`            | `/mostro`   | The settings and the trade database  |
| LND's `main` (ro) | `/mnt/lnd`  | LND's certificate and admin macaroon |

| Path            | Written by | Holds                                      |
| --------------- | ---------- | ------------------------------------------ |
| `settings.toml` | Actions    | Everything, including the Nostr identity   |
| `mostro.db`     | Mostro     | Orders, disputes, ratings, and message log |

**LND's credentials are read straight off the dependency mount**, not copied. The mount is idmapped so the files LND wrote as root are readable by Mostro's own user — which is what makes a read-only mount workable without a copy step that would then need re-running whenever LND rotated anything.

## File Models

One model, and it covers the entire configuration.

| File            | Format | Modelled                | Written by         |
| --------------- | ------ | ----------------------- | ------------------ |
| `settings.toml` | TOML   | Yes — `FileHelper.toml` | Actions and `main` |

Every section of Mostro's configuration is typed, with each field defaulted so an incomplete or hand-damaged file is repaired on read rather than rejected: the Lightning parameters, the Nostr identity and relays, the instance's public profile and trading limits, the database location, the admin RPC, the data-retention windows, the price-feed providers, and the anti-abuse bond.

Three groups are **written by the package rather than the user**:

- **LND's certificate and macaroon paths**, pinned to the dependency mount.
- **LND's gRPC address**, resolved at start over the internal bridge. **When LND has not published its binding it is left unwritten** rather than defaulted, so the daemon fails its connection visibly; the reactive read heals it with one restart when the binding appears.
- **The admin RPC**, fixed to loopback. It is Mostro's unauthenticated local admin channel, and pinning it is what keeps it off the network.
- **`allow_node_change`**, pinned false. Turning it on with open escrow is unsafe; it is not a user toggle.
- **`transport`**, pinned to `nip44`. Protocol v1 gift-wrap is not offered.

The settings file is read reactively, so any action that changes it restarts the daemon.

**The Nostr key is validated before it is stored.** The package decodes the bech32 itself and checks that it is a well-formed 32-byte `nsec`, because a mistyped key is otherwise accepted by the form and then crash-loops the daemon.

## Dependencies

One, and it is required.

| Dependency | Required | Health checks required | Mounted                         | Why                    |
| ---------- | -------- | ---------------------- | ------------------------------- | ---------------------- |
| LND        | Yes      | `sync-progress`        | `main`, read-only at `/mnt/lnd` | The escrow and payouts |

**A synced LND is required, not merely a running one.** Mostro holds funds in hold invoices and settles them; an unsynced node cannot do that safely, so the dependency asks for the sync check specifically.

**This package uses LND's admin macaroon**, which it needs to create hold invoices, settle and cancel them, and pay out. Anyone with control of this service has spending control of the node.

`main` also checks the dependency itself at start and refuses to come up unsatisfied, rather than starting into a broken state.

## Network Access and Interfaces

**None.** `setInterfaces` returns an empty array: no port is bound and no address is published.

That is not a limitation of the packaging — it is what Mostro is. Traders never connect to your instance; **everyone meets on shared Nostr relays**, and Mostro's only inbound channel is the messages it reads there. Its outbound connections are to those relays, to LND over the internal bridge, and to the price APIs.

The admin gRPC is loopback-only and unauthenticated by upstream's design; the package pins it there so it cannot be exported by accident.

## Installation and First-Run Flow

Install seeds the settings file with defaults, then reads it back and raises a `critical` task for each thing still missing: a Nostr key, and at least one relay.

**The service cannot start until both are set.** A `critical` task blocks startup, which is right here — a Mostro with no identity has nothing to sign with, and one with no relay has nowhere to publish.

Both checks read the actual configuration rather than a "configured" flag, so a restore that already carries a valid key and relays raises nothing.

Once running, the instance publishes its profile to its relays and starts accepting orders. **The relay set is what makes your instance findable**; the defaults are `wss://relay.mostro.network`, `wss://mostro-p2p.tech`, and `wss://relay.shadowbip.com`.

## Actions

Six actions, in three groups.

### Nostr Settings

#### Set Nostr Key

The `nsec` that is this instance's identity.

- **What it changes:** the key in the settings.
- **Cost:** the daemon restarts.
- **Rejected if malformed** — the bech32 checksum and the key length are both checked before anything is written.
- **Changing it changes who your instance is.** Reputation and existing orders are tied to the old identity.

#### Set Nostr Relays

The relays this instance publishes to and reads from.

- **What it changes:** the relay list.
- **Defaults are three relays** (`wss://relay.mostro.network`, `wss://mostro-p2p.tech`, `wss://relay.shadowbip.com`). An existing list is left as-is.
- **At least one is required**, and each is validated as a `ws://` or `wss://` URL in the handler as well as the form — the form's patterns do not apply to a programmatic submit.

### Lightning

#### Lightning Settings

The invoice parameters: expiry windows, the hold-invoice CLTV delta, the payment retry policy, and the payout-safety limits (final CLTV cap, escrow deadline margin, in-flight payout ceilings, route CLTV limit).

- **These govern escrow behavior.** A short hold expiry can strand a trade mid-flight; the defaults are upstream's.
- **`allow_node_change` is pinned off** by the package (disaster recovery only) and is not on this form.

### Trading

#### Mostro Settings

The instance's public profile — name, description, picture, website — plus its economics: the fee it charges, the routing-fee ceiling, order size limits, order and rating publication intervals, proof-of-work difficulty, the legacy price API URL, the accepted fiat currencies, and the developer fee percentage.

- **`transport` is pinned to nip44** (protocol v2) and is not on this form. Gift-wrap is not available.
- **Fiat currencies default to empty** (accept all). A comma-separated list still restricts which codes this instance will take.
- **`bitcoin_price_api_url` is the legacy single-source Yadio URL.** Prefer **Configure Price Providers** for the live multi-source block.

#### Expiration Settings

How long orders, ratings, disputes, fee audit records, and direct messages are retained.

#### Anti-Abuse Bond Settings

The optional bond takers or makers must post, its size, whether it is slashed on a timeout, and how the payout is handled.

- **Off by default.** Turning it on changes what counterparties must do to trade with you.

#### Price Provider Settings

Poll cadence, outlier and circuit-breaker limits, whether aggregated rates are published to Nostr, and each HTTP/Nostr source (Yadio, CoinGecko, currency-api, Blockchain.info, El Toque, trusted Mostro nodes).

- **Saving this form writes the `[price]` block** and takes the instance off the legacy single-source synthesis.
- **El Toque stays off** until you have a token and have confirmed the API; enabling it without a token is rejected.
- **Nostr prices stay off** until at least one trusted 64-character hex pubkey is listed.
- **CoinGecko keys and El Toque tokens are stored in `settings.toml`**, so they are in the backup.

## Tasks

Two, both raised at install and both blocking.

| Task             | Severity   | Raised when                     | Cleared when    |
| ---------------- | ---------- | ------------------------------- | --------------- |
| Set Nostr Key    | `critical` | No valid `nsec` in the settings | The action runs |
| Set Nostr Relays | `critical` | No valid relay in the settings  | The action runs |

They are raised independently, so an install that has one and not the other shows only the one it needs.

## Health Checks

One check, on the only daemon.

| Check     | Displayed as    | Method                          |
| --------- | --------------- | ------------------------------- |
| `primary` | "Mostro Daemon" | The admin RPC port is listening |

**It reports that the daemon started, not that it is trading.** Mostro binds its local admin RPC once it has come up; whether it is connected to its relays, whether LND is answering, and whether orders are being published are all invisible to this check and visible in the service logs.

There is no interface to test, so there is nothing more to observe from outside.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. That is the settings file and the trade database: orders, disputes, ratings, and the message log.

**The backup contains the Nostr private key**, in the settings file, in recoverable form. It is the instance's whole identity and its reputation, so the backup is as sensitive as the key itself. CoinGecko API keys and El Toque tokens, if you set them, are in the same file.

A restored instance comes back as the same Mostro to the network, with its history, and re-resolves LND's address on the new server. **Do not run the restored copy alongside the original** — two daemons signing as one identity on the same relays is not a supported configuration.

## Limitations and Differences

1. **No interfaces at all.** Everything reaches this service through Nostr relays.
2. **The admin macaroon is required**, so control of this service is spending control of your node.
3. **A synced LND is a hard requirement**, not just a running one.
4. **The Nostr key cannot be generated here** — it is supplied by the user, and changing it discards the instance's reputation.
5. **The backup holds the identity key.**
6. **Price feeds are external HTTP APIs** (and optionally trusted Mostro nodes over Nostr) and are contacted on a schedule, so the instance's traffic is not confined to LND.
7. **The admin RPC is unauthenticated** and is pinned to loopback for exactly that reason; it cannot be exported.
8. **Mainnet only.** The macaroon path is pinned to Bitcoin mainnet.
9. **Cashu escrow is not packaged.** Upstream can run without LND in Cashu mode; this package requires LND and leaves `[cashu]` unset.
10. **Changing Lightning node identity with open escrow is blocked.** `allow_node_change` is pinned false.

---

## Quick Reference for AI Consumers

```yaml
package_id: mostro
image: mostrop2p/mostro
architectures:
  - x86_64
  - aarch64
subcontainers:
  - mostro-sub
volumes:
  main: /mostro # settings.toml + mostro.db; LND's main is read-only at /mnt/lnd (idmapped 0→1000)
file_models:
  - settings.toml # the entire configuration, including the nsec
startos_managed_env_vars: [] # everything is settings.toml
dependencies:
  - lnd # required, kind: running, healthChecks: [sync-progress], admin macaroon
interfaces: {} # none declared — Mostro is reached through Nostr relays
actions:
  - nostr-key
  - nostr-relays
  - ln-settings
  - mostro-settings
  - expiration-settings
  - anti-abuse-bond-settings
  - price-settings
tasks:
  - { action: nostr-key, severity: critical } # install only, raised from the actual config
  - { action: nostr-relays, severity: critical } # install only, raised from the actual config
health_checks:
  - primary # displayed "Mostro Daemon"; only says the local admin RPC is bound
```
