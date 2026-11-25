import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { lndCredPaths } from '../utils'

export const DEFAULT_NOSTR_RELAYS = [
  'wss://relay.mostro.network',
  'wss://mostro-p2p.tech',
  'wss://relay.shadowbip.com',
]

export const defaultMakerBondPaymentTimeoutSeconds = 900

// Mostro 0.20.3 refuses a currency whose only two sources diverge, so these
// keep minor fiats priced. Values follow upstream settings.tpl.toml.
export const DEFAULT_YADIO_EXCEPT = ['ALL', 'BND', 'BTN', 'BZD', 'JMD', 'NPR']
export const LEGACY_CURRENCY_API_EXCEPT = ['CUP', 'MLC']
export const DEFAULT_CURRENCY_API_EXCEPT = [
  ...LEGACY_CURRENCY_API_EXCEPT,
  'AOA',
  'BIF',
  'DZD',
  'ETB',
  'GNF',
  'IQD',
  'IRR',
  'LYD',
  'MWK',
  'MZN',
  'SDG',
  'SLE',
  'SYP',
  'TND',
  'TTD',
  'VES',
  'YER',
]

export const DEFAULT_ELTOQUE_ONLY = ['CUP', 'MLC']

export const PEGGED_CODES = [
  'USDT',
  'USDC',
  'DOC',
  'BTC',
  'LBTC',
  'RBTC',
] as const
export type PeggedCode = (typeof PEGGED_CODES)[number]

// Bond hold-invoice CLTV bounds (mostro src/config/constants.rs).
const BOND_TRADE_MARGIN_BLOCKS = 144
const DEFAULT_BOND_BOOK_BLOCKS = 144
export const MAX_BOND_CLTV_DELTA = 864

export function effectiveBondCltvDelta(
  bondCltvDelta: number | undefined,
  holdInvoiceCltvDelta: number,
): number {
  return (
    bondCltvDelta ??
    Math.min(
      holdInvoiceCltvDelta +
        BOND_TRADE_MARGIN_BLOCKS +
        DEFAULT_BOND_BOOK_BLOCKS,
      MAX_BOND_CLTV_DELTA,
    )
  )
}

// With bonds enabled, mostrod refuses to start unless this holds.
export function isBondCltvValid(
  bondCltvDelta: number | undefined,
  holdInvoiceCltvDelta: number,
): boolean {
  const effective = effectiveBondCltvDelta(bondCltvDelta, holdInvoiceCltvDelta)
  return (
    effective > holdInvoiceCltvDelta + BOND_TRADE_MARGIN_BLOCKS &&
    effective <= MAX_BOND_CLTV_DELTA
  )
}

const natural = (defaultVal: number) =>
  z.number().int().nonnegative().catch(defaultVal)

const lightningSchema = z.looseObject({
  lnd_cert_file: z.string().catch(lndCredPaths.cert),
  lnd_macaroon_file: z.string().catch(lndCredPaths.macaroon),
  lnd_grpc_host: z.string().optional().catch(undefined),
  invoice_expiration_window: natural(3600),
  hold_invoice_cltv_delta: natural(144),
  // Mostro 0.19 rejects 0; repair it so a stale config cannot block startup.
  hold_invoice_expiration_window: z.number().int().positive().catch(300),
  payment_attempts: natural(3),
  payment_retries_interval: natural(60),
  max_final_cltv_expiry_delta: natural(144),
  // Mostro 0.20 refuses to start below 18; repair a stale config.
  escrow_deadline_margin_blocks: z.number().int().min(18).catch(24),
  max_inflight_payouts: natural(100),
  max_inflight_payouts_per_destination: natural(10),
  payment_cltv_limit: natural(1008),
  // Disaster recovery only. Enabling it with open escrow is unsafe; pin false.
  allow_node_change: z.literal(false).catch(false),
})

const nostrSchema = z.looseObject({
  nsec_privkey: z.string().catch(''),
  relays: z.array(z.string()).catch([...DEFAULT_NOSTR_RELAYS]),
})

const mostroSchema = z.looseObject({
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
  // Protocol v1 gift-wrap was removed in Mostro 0.19; a leftover
  // "gift-wrap" value refuses to start. Pin nip44 (protocol v2).
  transport: z.literal('nip44').catch('nip44'),
  publish_mostro_info_interval: natural(300),
  bitcoin_price_api_url: z.string().catch('https://api.yadio.io'),
  // Empty list = accept all fiat currencies (upstream settings.tpl.toml).
  fiat_currencies_accepted: z.array(z.string()).catch([]),
  max_orders_per_response: natural(10),
  dev_fee_percentage: z.number().catch(0.3),
  // Optional Serbero dispute-assistant pubkey (npub or hex). Blank = none.
  serbero_pubkey: z.string().catch(''),
})

const databaseSchema = z.looseObject({
  url: z.string().catch('sqlite://mostro.db'),
})

const expirationSchema = z.looseObject({
  order_days: natural(30),
  rating_days: natural(90),
  dispute_days: natural(90),
  fee_audit_days: natural(365),
  dm_days: natural(30),
})

// The admin RPC is localhost-only by Mostro's design (no auth; never exposed).
// These are fixed by the package, not user-configurable.
const rpcSchema = z.looseObject({
  enabled: z.boolean().catch(true),
  listen_address: z.string().catch('127.0.0.1'),
  port: natural(50051),
  rate_limiter_stale_duration: natural(3600),
})

// Mostro rejects providers containing both `only` and `except`.
function providerExclusions(
  provider: { only?: string[]; except?: string[] },
  defaults: string[],
): string[] | undefined {
  return (
    provider.except ?? (provider.only === undefined ? [...defaults] : undefined)
  )
}

const priceProviderYadioSchema = z
  .looseObject({
    enabled: z.boolean().catch(true),
    url: z.string().catch('https://api.yadio.io'),
    only: z.array(z.string()).optional().catch(undefined),
    except: z.array(z.string()).optional().catch(undefined),
  })
  .transform((provider) => ({
    ...provider,
    except: providerExclusions(provider, DEFAULT_YADIO_EXCEPT),
  }))

const priceProviderCoingeckoSchema = z.looseObject({
  enabled: z.boolean().catch(true),
  url: z.string().catch('https://api.coingecko.com/api/v3'),
  api_key: z.string().catch(''),
})

const priceProviderCurrencyApiSchema = z
  .looseObject({
    enabled: z.boolean().catch(true),
    url: z.string().catch('https://currency-api.pages.dev/v1'),
    fallback_urls: z
      .array(z.string())
      .catch([
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1',
      ]),
    only: z.array(z.string()).optional().catch(undefined),
    except: z.array(z.string()).optional().catch(undefined),
  })
  .transform((provider) => ({
    ...provider,
    except: providerExclusions(provider, DEFAULT_CURRENCY_API_EXCEPT),
  }))

const priceProviderBlockchainSchema = z.looseObject({
  enabled: z.boolean().catch(true),
  url: z.string().catch('https://blockchain.info'),
})

const priceProviderEltoqueSchema = z
  .looseObject({
    enabled: z.boolean().catch(false),
    url: z.string().catch('https://tasas.eltoque.com'),
    token: z.string().catch(''),
    only: z.array(z.string()).optional().catch(undefined),
    except: z.array(z.string()).optional().catch(undefined),
  })
  .transform((provider) => ({
    ...provider,
    only:
      provider.only ??
      (provider.except === undefined ? [...DEFAULT_ELTOQUE_ONLY] : undefined),
  }))

const priceProviderNostrSchema = z.looseObject({
  enabled: z.boolean().catch(false),
  trusted_nodes: z.array(z.string()).catch([]),
})

// Case-insensitive, matching Mostro. Unknown codes, which Mostro refuses, are
// dropped one by one so that a typo cannot lift the whole restriction.
const peggedScopeSchema = z
  .array(z.string())
  .transform((codes) => {
    const upper = codes.map((code) => code.trim().toUpperCase())
    return PEGGED_CODES.filter((code) => upper.includes(code))
  })
  .optional()
  .catch(undefined)

// Stablecoins and bitcoin on other networks, quoted 1:1 with no network call.
// Absent scopes quote every pegged code; upstream rejects unknown codes.
const priceProviderPeggedSchema = z.looseObject({
  enabled: z.boolean().catch(false),
  only: peggedScopeSchema,
  except: peggedScopeSchema,
})

const priceProvidersSchema = z.looseObject({
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
  pegged: priceProviderPeggedSchema.catch(() =>
    priceProviderPeggedSchema.parse({}),
  ),
})

const priceThresholdSchema = z.number().gt(0).max(100)

const priceSchema = z.looseObject({
  // Mostro refuses to start with 0 in either.
  update_interval_seconds: z.number().int().positive().catch(300),
  max_price_staleness_seconds: z.number().int().positive().catch(1800),
  outlier_threshold_pct: priceThresholdSchema.catch(5.0),
  // Tolerance for exactly two sources; unset follows outlier_threshold_pct.
  pair_divergence_pct: priceThresholdSchema.optional().catch(undefined),
  provider_timeout_seconds: natural(10),
  provider_failure_threshold: natural(3),
  provider_failure_cooldown_seconds: natural(120),
  publish_to_nostr: z.boolean().catch(true),
  providers: priceProvidersSchema.catch(() => priceProvidersSchema.parse({})),
})

const antiAbuseBondSchema = z.looseObject({
  enabled: z.boolean().catch(false),
  amount_pct: z.number().catch(0.01),
  base_amount_sats: natural(1000),
  apply_to: z.enum(['take', 'make', 'both']).catch('take'),
  slash_on_waiting_timeout: z.boolean().catch(false),
  slash_node_share_pct: z.number().catch(0.5),
  payout_invoice_window_seconds: natural(300),
  payout_max_retries: natural(5),
  payout_claim_window_days: natural(15),
  // Seconds a maker has to pay the maker bond (apply_to = make | both).
  // Upstream rejects 0; default matches settings.tpl.toml.
  maker_bond_payment_timeout_seconds: z
    .number()
    .int()
    .positive()
    .catch(defaultMakerBondPaymentTimeoutSeconds),
  // Unset, Mostro derives it from hold_invoice_cltv_delta (see
  // effectiveBondCltvDelta).
  bond_cltv_delta: z
    .number()
    .int()
    .positive()
    .max(MAX_BOND_CLTV_DELTA)
    .optional()
    .catch(undefined),
})

// Payment-account history / anti-triangulation. Opt-in; absent ≡ disabled.
const payerHistorySchema = z.looseObject({
  enabled: z.boolean().catch(false),
  require_declaration: z.boolean().catch(false),
  experienced_min_trades: natural(5),
  experienced_min_days: natural(30),
})

const reputationIssuerSchema = z.looseObject({
  name: z.string(),
  keys: z.array(z.string()),
})

// This package does not support reputation import; pin enabled false.
const reputationImportSchema = z.looseObject({
  enabled: z.literal(false).catch(false),
  max_lifetime_seconds: natural(604800),
  issuers: z.array(reputationIssuerSchema).catch([]),
})

const shape = z.looseObject({
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
  payer_history: payerHistorySchema.catch(() => payerHistorySchema.parse({})),
  reputation_import: reputationImportSchema.catch(() =>
    reputationImportSchema.parse({}),
  ),
})

export const daemon_settings = FileHelper.toml(
  { base: sdk.volumes.main, subpath: './settings.toml' },
  shape,
)
