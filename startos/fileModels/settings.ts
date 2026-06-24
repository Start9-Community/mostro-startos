import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { lndCredPaths } from '../utils'

const natural = (defaultVal: number) =>
  z.number().int().nonnegative().catch(defaultVal)

const lightningSchema = z.object({
  lnd_cert_file: z.string().catch(lndCredPaths.cert),
  lnd_macaroon_file: z.string().catch(lndCredPaths.macaroon),
  lnd_grpc_host: z.string().catch(lndCredPaths.grpcHost),
  invoice_expiration_window: natural(3600),
  hold_invoice_cltv_delta: natural(144),
  hold_invoice_expiration_window: natural(300),
  payment_attempts: natural(3),
  payment_retries_interval: natural(60),
})

const nostrSchema = z.object({
  nsec_privkey: z.string().catch(''),
  relays: z.array(z.string()).catch(['wss://relay.mostro.network']),
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
  transport: z.enum(['gift-wrap', 'nip44']).catch('gift-wrap'),
  publish_mostro_info_interval: natural(300),
  bitcoin_price_api_url: z.string().catch('https://api.yadio.io'),
  fiat_currencies_accepted: z
    .array(z.string())
    .catch(['USD', 'EUR', 'ARS', 'CUP']),
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
    .catch(['https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1']),
  except: z.array(z.string()).catch(['CUP', 'MLC']),
})

const priceProviderBlockchainSchema = z.object({
  enabled: z.boolean().catch(true),
  url: z.string().catch('https://blockchain.info'),
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
