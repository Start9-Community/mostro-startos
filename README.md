<p align="center">
  <img src="icon.svg" alt="Mostro Logo" width="21%">
</p>

# Mostro on StartOS

> **Upstream docs:** <https://mostro.network/>
>
> Everything not listed in this document should behave the same as upstream
> Mostro. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable.

[Mostro](https://mostro.network/) is a peer-to-peer, no-KYC Bitcoin exchange daemon (`mostrod`) built on the Lightning Network and the Nostr protocol. It acts as a decentralized escrow using Lightning hold invoices, brokering trades that are negotiated and settled over Nostr relays. Upstream source: <https://github.com/MostroP2P/mostro>.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)

---

## Image and Container Runtime

| | |
| --- | --- |
| Image source | Upstream `mostrop2p/mostro` Docker image, unmodified |
| Architectures | x86_64, aarch64 |
| Entrypoint | `mostrod -d /mostro` (data directory on the `main` volume) |

The daemon runs as the image's non-root `mostrouser`. A root `prepare-runtime` one-shot runs first to stage the Lightning credentials (see Dependencies) and fix ownership before the daemon starts.

## Volume and Data Layout

| Path | Purpose |
| --- | --- |
| `/mostro` | The `main` volume — the daemon's data directory (read-write) |
| `/mostro/settings.toml` | Generated configuration, written by the package from StartOS actions |
| `/mostro/mostro.db` | Embedded SQLite database (orders, ratings, disputes) |
| `/mostro/lnd-creds/` | Writable copies of the LND TLS cert and admin macaroon |
| `/mnt/lnd` | The LND dependency's `main` volume, mounted read-only |

## Installation and First-Run Flow

- The package seeds `settings.toml` with defaults on install — there is no upstream config file to edit by hand.
- Because `mostrod` cannot operate without a Nostr identity and at least one relay, installation reads the actual config and creates a separate **critical task** for each missing piece — **Set Nostr Key** and **Set Nostr Relays** — before the daemon will run usefully. A default relay is seeded, so on a fresh install typically only the key is required.
- LND is a required dependency and must be installed and fully synced before Mostro is considered satisfied.

## Configuration Management

All configuration is StartOS-managed: the package owns `settings.toml` and rewrites it from the values you submit through actions. There is no separate upstream configuration UI.

| StartOS-Managed (via actions) | Not Applicable |
| --- | --- |
| Lightning invoice/payment parameters, Nostr keys & relays, trading/business parameters, event-retention windows, anti-abuse bond policy | Mostro exposes no in-app settings UI; everything is driven from `settings.toml` |

The LND credential paths and gRPC host in `settings.toml` are managed by the package and point at the mounted/staged LND credentials; you do not set them manually.

## Network Access and Interfaces

**None.** Mostro exposes no inbound network interface. It is a Nostr/Lightning client: it opens only outbound connections — to Nostr relays and to LND — and traders interact with it entirely through shared Nostr relays, never by connecting to this service directly. Mostro's admin gRPC runs on `127.0.0.1:50051` (localhost) only, matching upstream's design (no authentication, never network-exposed); it is administered from the StartOS box.

## Actions

All actions are visible (`enabled`) at any service status, grouped in the StartOS UI by area: **Nostr Settings** (key, relays), **Lightning**, and **Trading** (Mostro/expiration/anti-abuse-bond).

| Action | Purpose | Inputs | Output |
| --- | --- | --- | --- |
| Configure Lightning Node Settings | Invoice expiry, hold-invoice CLTV delta, payment attempts/intervals | Numeric Lightning parameters | Writes `settings.toml` |
| Set Nostr Key | Set the Nostr identity (nsec) the daemon signs and trades with | `nsec` private key (masked) | Writes `settings.toml`; clears its task |
| Set Nostr Relays | Manage the Nostr relays Mostro publishes to and reads from | Add/remove list of `wss://`/`ws://` relay URLs (≥1) | Writes `settings.toml`; clears its task |
| Configure Mostro Settings | Trading and business logic (metadata, fees, order limits, transport, fiat currencies, price API) | Many trading parameters | Writes `settings.toml` |
| Configure Event Expiration | Retention windows for each Nostr event type | Per-event-kind day counts | Writes `settings.toml` |
| Configure Anti-Abuse Bond | Optional Lightning hold-invoice bonds to deter abusive takers/makers | Bond policy parameters | Writes `settings.toml` |

## Backups and Restore

The entire `main` volume is backed up — configuration, the SQLite database (order/rating/dispute history), and the staged LND credential copies. On restore the daemon resumes from the restored data directory; LND connectivity is re-established from the restored settings.

## Health Checks

| Check | Meaning |
| --- | --- |
| Mostro Daemon | Succeeds once `mostrod` is up and its localhost admin RPC port (`50051`) is listening. |

## Dependencies

| Dependency | Required | Version | Health checks | Mount | Purpose |
| --- | --- | --- | --- | --- | --- |
| LND | Yes | recent LND (see manifest) | `sync-progress` (must be fully synced) | `main` volume mounted read-only at `/mnt/lnd` | Lightning node for hold-invoice escrow and payments |

The package copies LND's `tls.cert` and `admin.macaroon` from the read-only mount into a writable, `mostrouser`-owned directory (`/mostro/lnd-creds/`) at startup, because the daemon's non-root user cannot read the credentials in place. It connects to LND's gRPC endpoint at the internal `lnd.startos` hostname.

## Limitations and Differences

1. **A Nostr key and relay are mandatory.** The daemon will not function until the Nostr key and at least one relay are set; separate critical tasks enforce each on first run.
2. **LND must be fully synced.** The dependency gates on LND's `sync-progress` health check, so Mostro waits for a fully synced node rather than merely a running one.
3. **The admin RPC is localhost-only.** Following upstream's design, Mostro's gRPC admin API has no authentication and is never network-exposed; administer the instance from the StartOS box. There is no off-box admin access.
4. **No in-app configuration UI.** All settings are managed through StartOS actions that rewrite `settings.toml`.

## What Is Unchanged from Upstream

- The `mostrod` daemon, the trading/escrow protocol, hold-invoice mechanics, reputation system, and Nostr event formats behave exactly as upstream documents.
- The configuration keys in `settings.toml` are upstream's own; StartOS only manages how the file is generated.
- The admin gRPC API surface is upstream's.

## Contributing

See [CONTRIBUTING in the upstream project](https://github.com/MostroP2P/mostro) for the daemon, and the package repository for StartOS packaging changes.

---

## Quick Reference for AI Consumers

```yaml
package_id: mostro
architectures: [x86_64, aarch64]
entrypoint: mostrod -d /mostro
volumes:
  main: /mostro
mounts:
  lnd_main: /mnt/lnd   # read-only
ports: none            # no inbound interface; admin gRPC is localhost-only (127.0.0.1:50051)
dependencies:
  - lnd                # required; health check: sync-progress
config_management: file   # settings.toml, written by package actions (no env vars)
actions:
  - nostr-key
  - nostr-relays
  - ln-settings
  - mostro-settings
  - expiration-settings
  - anti-abuse-bond-settings
action_groups: [Nostr Settings, Lightning, Trading]
```
