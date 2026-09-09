import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { lndCredPaths } from '../utils'

export const DEFAULT_NOSTR_RELAYS = [
  'wss://relay.mostro.network',
  'wss://mostro-p2p.tech',
  'wss://relay.shadowbip.com',
]

const natural = (defaultVal: number) =>
  z.number().int().nonnegative().catch(defaultVal)

const lightningSchema = z.object({
  lnd_cert_file: z.string().catch(lndCredPaths.cert),
  lnd_macaroon_file: z.string().catch(lndCredPaths.macaroon),
  lnd_grpc_host: z.string().optional().catch(undefined),
  invoice_expiration_window: natural(3600),
  hold_invoice_cltv_delta: natural(144),
  hold_invoice_expiration_window: natural(300),
  payment_attempts: natural(3),
  payment_retries_interval: natural(60),
  max_final_cltv_expiry_delta: natural(144),
  escrow_deadline_margin_blocks: natural(24),
  max_inflight_payouts: natural(100),
  max_inflight_payouts_per_destination: natural(10),
  payment_cltv_limit: natural(1008),
  // Disaster recovery only. Enabling it with open escrow is unsafe; pin false.
  allow_node_change: z.literal(false).catch(false),
})

const nostrSchema = z.object({
  nsec_privkey: z.string().catch(''),
  relays: z.array(z.string()).catch([...DEFAULT_NOSTR_RELAYS]),
})

const mostroSchema = z.object({
  name: z.string().catch(''),
  about: z.string().catch(''),
  picture: z.string().catch(''),
  website: z.string().catch(''),
  fee: z.number().catch(0),
  max_routing_fee: z.number().catch(0.002),
  max_order_amount: natural(1_000_000),
  min_payment_amount: natural(100),
  expiration_hours: natural(24),
  max_expiration_days: natural(15),
  expiration_seconds: natural(900),
  user_rates_sent_interval_seconds: natural(3600),
  publish_relays_interval: natural(60),
  pow: natural(0),
  // Protocol v1 gift-wrap is no longer offered. Pin nip44 (protocol v2).
  transport: z.literal('nip44').catch('nip44'),
  publish_mostro_info_interval: natural(300),
  bitcoin_price_api_url: z.string().catch('https://api.yadio.io'),
  // Empty list = accept all fiat currencies (upstream settings.tpl.toml).
  fiat_currencies_accepted: z.array(z.string()).catch([]),
  max_orders_per_response: natural(10),
  dev_fee_percentage: z.number().catch(0.3),
})

const databaseSchema = z.object({
  url: z.string().catch('sqlite://mostro.db'),
})

const expirationSchema = z.object({
  order_days: natural(30),
  rating_days: natural(90),
  dispute_days: natural(90),
  fee_audit_days: natural(365),
  dm_days: natural(30),
})

// The admin RPC is localhost-only by Mostro's design (no auth; never exposed).
// These are fixed by the package, not user-configurable.
const rpcSchema = z.object({
  enabled: z.boolean().catch(true),
  listen_address: z.string().catch('127.0.0.1'),
  port: natural(50051),
  rate_limiter_stale_duration: natural(3600),
})

const priceProviderYadioSchema = z.object({
  enabled: z.boolean().catch(true),
  url: z.string().catch('https://api.yadio.io'),
})

const priceProviderCoingeckoSchema = z.object({
  enabled: z.boolean().catch(true),
  url: z.string().catch('https://api.coingecko.com/api/v3'),
  api_key: z.string().catch(''),
})

const priceProviderCurrencyApiSchema = z.object({
  enabled: z.boolean().catch(true),
  url: z.string().catch('https://currency-api.pages.dev/v1'),
  fallback_urls: z
    .array(z.string())
    .catch([
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1',
    ]),
  except: z.array(z.string()).catch(['CUP', 'MLC']),
})

const priceProviderBlockchainSchema = z.object({
  enabled: z.boolean().catch(true),
  url: z.string().catch('https://blockchain.info'),
})

const priceProviderEltoqueSchema = z.object({
  enabled: z.boolean().catch(false),
  url: z.string().catch('https://tasas.eltoque.com'),
  token: z.string().catch(''),
  only: z.array(z.string()).catch(['CUP', 'MLC']),
})

const priceProviderNostrSchema = z.object({
  enabled: z.boolean().catch(false),
  trusted_nodes: z.array(z.string()).catch([]),
})

const priceProvidersSchema = z.object({
  yadio: priceProviderYadioSchema.catch(() =>
    priceProviderYadioSchema.parse({}),
  ),
  coingecko: priceProviderCoingeckoSchema.catch(() =>
    priceProviderCoingeckoSchema.parse({}),
  ),
  currency_api: priceProviderCurrencyApiSchema.catch(() =>
    priceProviderCurrencyApiSchema.parse({}),
  ),
  blockchain: priceProviderBlockchainSchema.catch(() =>
    priceProviderBlockchainSchema.parse({}),
  ),
  eltoque: priceProviderEltoqueSchema.catch(() =>
    priceProviderEltoqueSchema.parse({}),
  ),
  nostr: priceProviderNostrSchema.catch(() =>
    priceProviderNostrSchema.parse({}),
  ),
})

const priceSchema = z.object({
  update_interval_seconds: natural(300),
  max_price_staleness_seconds: natural(1800),
  outlier_threshold_pct: z.number().catch(5.0),
  provider_timeout_seconds: natural(10),
  provider_failure_threshold: natural(3),
  provider_failure_cooldown_seconds: natural(120),
  publish_to_nostr: z.boolean().catch(true),
  providers: priceProvidersSchema.catch(() => priceProvidersSchema.parse({})),
})

const antiAbuseBondSchema = z.object({
  enabled: z.boolean().catch(false),
  amount_pct: z.number().catch(0.01),
  base_amount_sats: natural(1000),
  apply_to: z.enum(['take', 'make', 'both']).catch('take'),
  slash_on_waiting_timeout: z.boolean().catch(false),
  slash_node_share_pct: z.number().catch(0.5),
  payout_invoice_window_seconds: natural(300),
  payout_max_retries: natural(5),
  payout_claim_window_days: natural(15),
})

const shape = z.object({
  lightning: lightningSchema.catch(() => lightningSchema.parse({})),
  nostr: nostrSchema.catch(() => nostrSchema.parse({})),
  mostro: mostroSchema.catch(() => mostroSchema.parse({})),
  database: databaseSchema.catch(() => databaseSchema.parse({})),
  rpc: rpcSchema.catch(() => rpcSchema.parse({})),
  expiration: expirationSchema.catch(() => expirationSchema.parse({})),
  price: priceSchema.catch(() => priceSchema.parse({})),
  anti_abuse_bond: antiAbuseBondSchema.catch(() =>
    antiAbuseBondSchema.parse({}),
  ),
})

export const daemon_settings = FileHelper.toml(
  { base: sdk.volumes.main, subpath: './settings.toml' },
  shape,
)
