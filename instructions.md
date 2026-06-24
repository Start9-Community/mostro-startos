# Mostro

Mostro needs a **fully synced LND node** and a **Nostr identity** before it can trade. Install and sync LND first; a setup task walks you through the Nostr key on first launch.

## Documentation

- [Mostro website](https://mostro.network/) — what Mostro is and how it works.
- [Mostro protocol documentation](https://mostro.network/protocol/) — the technical reference for the trading and escrow protocol.

## What you get on StartOS

Installing this runs **your own Mostro instance** — the `mostrod` daemon that acts as a coordinator and Lightning escrow for no-KYC Bitcoin trades. It is a background service with **no web interface**: it makes only outbound connections (to Nostr relays and to your LND node), and traders interact with it over Nostr — never by connecting to your StartOS box. StartOS manages the daemon's `settings.toml` for you through the actions below.

## Getting set up

1. **Install and sync LND.** Mostro requires LND and waits until it is fully synced. Do this first.
2. **Set your Nostr key.** On install you'll see a required **Set Nostr Key** task — paste your Nostr private key (`nsec…`). This key *is* your instance's identity; its public form (`npub`) is how traders find and address your instance.
3. **Relays (usually leave as-is).** A default relay is provided, so you typically don't need to touch this. Use **Set Nostr Relays** to add your own relays or point at a relay you run.
4. **Trading parameters (optional).** **Configure Mostro Settings** sets your instance name/metadata, fees, order limits, and accepted fiat currencies; **Configure Lightning Node Settings** tunes invoice and payment behavior; **Configure Event Expiration** and **Configure Anti-Abuse Bond** adjust event retention and trade bonding. The defaults are sensible to start.
5. **Start Mostro.** Once the Nostr key is set and LND is synced, start the service. Changing a setting afterward restarts the daemon automatically so it picks up the new config — no manual restart needed.

## Using Mostro

There is **no app to open and no interface to connect to** — and that's expected. Mostro is a Nostr/Lightning *client*, just like the people trading on it. Your instance and the trader clients each connect *outward* to shared Nostr **relays** and communicate by passing messages through those relays; nothing connects to your StartOS box directly.

So "using" your instance means people **trade against it with a Mostro client app**:

1. A trader installs a Mostro client — [mostro-cli](https://github.com/MostroP2P/mostro-cli) (command line) or [Mostro Mobile](https://github.com/MostroP2P/mobile) (Android) — and points it at the **same relay(s)** your instance uses, plus your instance's **npub**. (Clients can also discover instances on a relay automatically, since `mostrod` publishes a "Mostro info" event.)
2. They post an order; it lands on the relay; your `mostrod` picks it up, runs the Lightning hold-invoice escrow, and replies over the relay; their client shows the result.

### Administering your instance

Dispute resolution and admin overrides go through Mostro's gRPC **admin API**, which — by Mostro's own design — is **localhost-only, with no authentication, and is never exposed on the network**. You run an admin client against it from the StartOS box itself (for example via `start-cli package attach`), or use the upstream [MostriX](https://github.com/MostroP2P/mostrix) admin tool there. Off-box admin access is intentionally not provided; see the upstream RPC/admin documentation for the available commands.
