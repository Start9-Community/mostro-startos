import {
  daemon_settings,
  DEFAULT_CURRENCY_API_EXCEPT,
  DEFAULT_ELTOQUE_ONLY,
  DEFAULT_YADIO_EXCEPT,
  PEGGED_CODES,
  PeggedCode,
} from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value, List } = sdk

const DEFAULT_CURRENCY_API_FALLBACK = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1',
]

const PEGGED_LABELS: Record<PeggedCode, string> = {
  USDT: 'USDT → USD',
  USDC: 'USDC → USD',
  DOC: 'DOC → USD',
  BTC: 'BTC (on-chain) → sats',
  LBTC: 'LBTC (Liquid) → sats',
  RBTC: 'RBTC (Rootstock) → sats',
}

const HEX_PUBKEY = /^[0-9a-fA-F]{64}$/
const HTTP_URL = /^https?:\/\/\S+$/

function asEnabled(value: boolean | undefined, fallback: boolean) {
  return (value ?? fallback) ? ('true' as const) : ('false' as const)
}

function parseCodeList(values: string[]): string[] {
  return values.map((v) => v.trim().toUpperCase()).filter((v) => v.length > 0)
}

export const inputSpec = InputSpec.of({
  update_interval_seconds: Value.number({
    name: i18n('Price Update Interval'),
    description: i18n('How often to poll price providers, in seconds'),
    default: 300,
    required: true,
    integer: true,
    min: 30,
    max: 86400,
  }),
  max_price_staleness_seconds: Value.number({
    name: i18n('Max Price Staleness'),
    description: i18n(
      'Maximum age of a cached rate before it is considered stale, in seconds',
    ),
    default: 1800,
    required: true,
    integer: true,
    min: 60,
    max: 86400,
  }),
  outlier_threshold_pct: Value.number({
    name: i18n('Outlier Threshold'),
    description: i18n(
      'Discard a source that deviates more than this percent from the median (only with 3+ sources)',
    ),
    default: 5,
    required: true,
    integer: false,
    min: 0.1,
    max: 50,
  }),
  pair_divergence_pct: Value.number({
    name: i18n('Two-Source Divergence Limit'),
    description: i18n(
      'For a currency with exactly two sources: if they differ by more than this percent of their mean, the currency is refused until they agree again. Leave empty to use Outlier Threshold.',
    ),
    default: null,
    required: false,
    integer: false,
    min: 0.1,
    max: 100,
  }),
  provider_timeout_seconds: Value.number({
    name: i18n('Provider Timeout'),
    description: i18n('Per-provider HTTP request timeout in seconds'),
    default: 10,
    required: true,
    integer: true,
    min: 1,
    max: 120,
  }),
  provider_failure_threshold: Value.number({
    name: i18n('Provider Failure Threshold'),
    description: i18n(
      'Consecutive failures before a provider is put in cooldown',
    ),
    default: 3,
    required: true,
    integer: true,
    min: 1,
    max: 20,
  }),
  provider_failure_cooldown_seconds: Value.number({
    name: i18n('Provider Failure Cooldown'),
    description: i18n(
      'Cooldown after a provider trips the failure threshold, in seconds',
    ),
    default: 120,
    required: true,
    integer: true,
    min: 10,
    max: 1800,
  }),
  publish_to_nostr: Value.select({
    name: i18n('Publish Rates To Nostr'),
    description: i18n(
      '- Enabled: Mostro publishes its aggregated rates as a Nostr event (kind 30078), which other Mostro nodes can use as a price source\n- Disabled: the rates are used by this node only',
    ),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  yadio_enabled: Value.select({
    name: i18n('Yadio Enabled'),
    description: i18n(
      '- Enabled: Yadio is one of the price sources\n- Disabled: not queried',
    ),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  yadio_url: Value.text({
    name: i18n('Yadio URL'),
    description: null,
    placeholder: 'https://api.yadio.io',
    default: 'https://api.yadio.io',
    required: true,
  }),
  yadio_except: Value.list(
    List.text(
      {
        name: i18n('Yadio Except'),
        description: i18n('Fiat codes this source must not contribute'),
        default: DEFAULT_YADIO_EXCEPT,
        minLength: 0,
      },
      {
        placeholder: 'JMD',
      },
    ),
  ),
  coingecko_enabled: Value.select({
    name: i18n('CoinGecko Enabled'),
    description: i18n(
      '- Enabled: CoinGecko is one of the price sources\n- Disabled: not queried',
    ),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  coingecko_url: Value.text({
    name: i18n('CoinGecko URL'),
    description: i18n(
      'CoinGecko API base URL (use the pro host if you have a pro key)',
    ),
    placeholder: 'https://api.coingecko.com/api/v3',
    default: 'https://api.coingecko.com/api/v3',
    required: true,
  }),
  coingecko_api_key: Value.text({
    name: i18n('CoinGecko API Key'),
    description: i18n(
      "Optional demo or pro API key; raises CoinGecko's rate limits.",
    ),
    placeholder: 'CG-xxxx',
    default: '',
    required: false,
    masked: true,
  }),
  currency_api_enabled: Value.select({
    name: i18n('Currency API Enabled'),
    description: i18n(
      '- Enabled: the keyless currency-api CDN is one of the price sources (300+ currencies at official rates; codes with a parallel market, such as CUP and VES, are excluded by default)\n- Disabled: not queried',
    ),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  currency_api_url: Value.text({
    name: i18n('Currency API URL'),
    description: i18n('Primary currency-api base URL'),
    placeholder: 'https://currency-api.pages.dev/v1',
    default: 'https://currency-api.pages.dev/v1',
    required: true,
  }),
  currency_api_fallback_urls: Value.list(
    List.text(
      {
        name: i18n('Currency API Fallback URLs'),
        description: i18n('Ordered mirrors tried when the primary URL fails'),
        default: DEFAULT_CURRENCY_API_FALLBACK,
        minLength: 0,
      },
      {
        placeholder:
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1',
        patterns: [
          {
            regex: '^https?://\\S+$',
            description: i18n('Must be an http:// or https:// URL'),
          },
        ],
      },
    ),
  ),
  currency_api_except: Value.list(
    List.text(
      {
        name: i18n('Currency API Except'),
        description: i18n('Fiat codes this source must not contribute'),
        default: DEFAULT_CURRENCY_API_EXCEPT,
        minLength: 0,
      },
      {
        placeholder: 'CUP',
      },
    ),
  ),
  blockchain_enabled: Value.select({
    name: i18n('Blockchain.info Enabled'),
    description: i18n(
      '- Enabled: Blockchain.info is one of the price sources (about 28 major fiat currencies)\n- Disabled: not queried',
    ),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  blockchain_url: Value.text({
    name: i18n('Blockchain.info URL'),
    description: null,
    placeholder: 'https://blockchain.info',
    default: 'https://blockchain.info',
    required: true,
  }),
  eltoque_enabled: Value.select({
    name: i18n('El Toque Enabled'),
    description: i18n(
      '- Enabled: El Toque supplies informal-market CUP and MLC rates and needs El Toque Token. Mostro marks this source provisional; keep it off until you have confirmed it works\n- Disabled: not queried',
    ),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  eltoque_url: Value.text({
    name: i18n('El Toque URL'),
    description: null,
    placeholder: 'https://tasas.eltoque.com',
    default: 'https://tasas.eltoque.com',
    required: true,
  }),
  eltoque_token: Value.text({
    name: i18n('El Toque Token'),
    description: i18n('Bearer token required when El Toque is enabled'),
    placeholder: 'xxxx',
    default: '',
    required: false,
    masked: true,
  }),
  eltoque_only: Value.list(
    List.text(
      {
        name: i18n('El Toque Currencies'),
        description: i18n(
          'Fiat codes this source may contribute (CUP and MLC)',
        ),
        default: DEFAULT_ELTOQUE_ONLY,
        minLength: 0,
      },
      {
        placeholder: 'CUP',
      },
    ),
  ),
  nostr_enabled: Value.select({
    name: i18n('Nostr Price Enabled'),
    description: i18n(
      '- Enabled: take rates from the price events (kind 30078) that the Trusted Price Nodes publish, over the relays set in Nostr Settings; for regions where price APIs are blocked\n- Disabled: not used',
    ),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  nostr_trusted_nodes: Value.list(
    List.text(
      {
        name: i18n('Trusted Price Nodes'),
        description: i18n(
          'Hex pubkeys of Mostro nodes whose kind-30078 price events you trust',
        ),
        default: [],
        minLength: 0,
      },
      {
        placeholder: '64-character hex pubkey',
        patterns: [
          {
            regex: '^[0-9a-fA-F]{64}$',
            description: i18n('Must be a 64-character hex pubkey'),
          },
        ],
      },
    ),
  ),
  pegged_enabled: Value.select({
    name: i18n('Pegged Currencies Enabled'),
    description: i18n(
      '- Enabled: accept orders in stablecoins (priced from the USD rate, amount in whole coins) and bitcoin on other networks (amount in sats), quoted 1:1 with no network call. If Fiat Currencies Accepted in Mostro Settings is not empty, add every code you quote there too\n- Disabled: market-priced orders in these codes are refused',
    ),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  pegged_codes: Value.multiselect({
    name: i18n('Pegged Codes'),
    description: i18n('Pegged codes this node quotes when enabled'),
    default: [...PEGGED_CODES],
    values: PEGGED_LABELS,
    minLength: 0,
  }),
})

export const priceSettings = sdk.Action.withInput(
  'price-settings',

  async () => ({
    name: i18n('Configure Price Providers'),
    description: i18n('Configure multi-source Bitcoin and fiat price feeds'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Trading'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const price = await daemon_settings.read((s) => s?.price).once()
    const providers = price?.providers

    return {
      update_interval_seconds: price?.update_interval_seconds ?? 300,
      max_price_staleness_seconds: price?.max_price_staleness_seconds ?? 1800,
      outlier_threshold_pct: price?.outlier_threshold_pct ?? 5,
      pair_divergence_pct: price?.pair_divergence_pct ?? null,
      provider_timeout_seconds: price?.provider_timeout_seconds ?? 10,
      provider_failure_threshold: price?.provider_failure_threshold ?? 3,
      provider_failure_cooldown_seconds:
        price?.provider_failure_cooldown_seconds ?? 120,
      publish_to_nostr: asEnabled(price?.publish_to_nostr, true),
      yadio_enabled: asEnabled(providers?.yadio?.enabled, true),
      yadio_url: providers?.yadio?.url ?? 'https://api.yadio.io',
      yadio_except: providers?.yadio
        ? (providers.yadio.except ?? [])
        : DEFAULT_YADIO_EXCEPT,
      coingecko_enabled: asEnabled(providers?.coingecko?.enabled, true),
      coingecko_url:
        providers?.coingecko?.url ?? 'https://api.coingecko.com/api/v3',
      coingecko_api_key: providers?.coingecko?.api_key ?? '',
      currency_api_enabled: asEnabled(providers?.currency_api?.enabled, true),
      currency_api_url:
        providers?.currency_api?.url ?? 'https://currency-api.pages.dev/v1',
      currency_api_fallback_urls:
        providers?.currency_api?.fallback_urls ?? DEFAULT_CURRENCY_API_FALLBACK,
      currency_api_except: providers?.currency_api
        ? (providers.currency_api.except ?? [])
        : DEFAULT_CURRENCY_API_EXCEPT,
      blockchain_enabled: asEnabled(providers?.blockchain?.enabled, true),
      blockchain_url: providers?.blockchain?.url ?? 'https://blockchain.info',
      eltoque_enabled: asEnabled(providers?.eltoque?.enabled, false),
      eltoque_url: providers?.eltoque?.url ?? 'https://tasas.eltoque.com',
      eltoque_token: providers?.eltoque?.token ?? '',
      eltoque_only: providers?.eltoque
        ? (providers.eltoque.only ?? [])
        : DEFAULT_ELTOQUE_ONLY,
      nostr_enabled: asEnabled(providers?.nostr?.enabled, false),
      nostr_trusted_nodes: providers?.nostr?.trusted_nodes ?? [],
      pegged_enabled: asEnabled(providers?.pegged?.enabled, false),
      pegged_codes: PEGGED_CODES.filter((code) =>
        providers?.pegged?.only !== undefined
          ? providers.pegged.only.includes(code)
          : !providers?.pegged?.except?.includes(code),
      ),
    }
  },

  async ({ effects, input }) => {
    const eltoqueEnabled = input.eltoque_enabled === 'true'
    const nostrEnabled = input.nostr_enabled === 'true'
    const trustedNodes = input.nostr_trusted_nodes
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
    const invalidNodes = trustedNodes.filter((n) => !HEX_PUBKEY.test(n))
    if (invalidNodes.length > 0) {
      throw new Error(i18n('Must be a 64-character hex pubkey'))
    }
    if (eltoqueEnabled && !input.eltoque_token?.trim()) {
      throw new Error(i18n('El Toque requires a token when it is enabled.'))
    }
    if (nostrEnabled && trustedNodes.length === 0) {
      throw new Error(
        i18n(
          'Enable Nostr prices only after adding at least one trusted node pubkey.',
        ),
      )
    }

    const httpUrls = [
      input.yadio_url,
      input.coingecko_url,
      input.currency_api_url,
      ...input.currency_api_fallback_urls,
      input.blockchain_url,
      input.eltoque_url,
    ].map((u) => u.trim())
    const invalidUrls = httpUrls.filter(
      (u) => u.length > 0 && !HTTP_URL.test(u),
    )
    if (invalidUrls.length > 0) {
      throw new Error(i18n('Must be an http:// or https:// URL'))
    }

    const scopes = await daemon_settings
      .read((s) => ({
        yadioOnly: s?.price.providers.yadio.only,
        currencyApiOnly: s?.price.providers.currency_api.only,
        eltoqueExcept: s?.price.providers.eltoque.except,
      }))
      .once()
    const yadioExcept = parseCodeList(input.yadio_except)
    const currencyApiExcept = parseCodeList(input.currency_api_except)
    if (
      (scopes?.yadioOnly !== undefined && yadioExcept.length > 0) ||
      (scopes?.currencyApiOnly !== undefined && currencyApiExcept.length > 0)
    ) {
      throw new Error(
        i18n(
          'A provider with a custom only list cannot also have exclusions. Leave its exclusions empty to preserve the only list.',
        ),
      )
    }

    // A saved `except` stays until the operator lists currencies to allow.
    const eltoqueOnly = parseCodeList(input.eltoque_only)
    const keepEltoqueExcept =
      scopes?.eltoqueExcept !== undefined && eltoqueOnly.length === 0

    await daemon_settings.merge(effects, {
      price: {
        update_interval_seconds: input.update_interval_seconds,
        max_price_staleness_seconds: input.max_price_staleness_seconds,
        outlier_threshold_pct: input.outlier_threshold_pct,
        pair_divergence_pct: input.pair_divergence_pct ?? undefined,
        provider_timeout_seconds: input.provider_timeout_seconds,
        provider_failure_threshold: input.provider_failure_threshold,
        provider_failure_cooldown_seconds:
          input.provider_failure_cooldown_seconds,
        publish_to_nostr: input.publish_to_nostr === 'true',
        providers: {
          yadio: {
            enabled: input.yadio_enabled === 'true',
            url: input.yadio_url.trim(),
            except: scopes?.yadioOnly === undefined ? yadioExcept : undefined,
          },
          coingecko: {
            enabled: input.coingecko_enabled === 'true',
            url: input.coingecko_url.trim(),
            api_key: input.coingecko_api_key?.trim() ?? '',
          },
          currency_api: {
            enabled: input.currency_api_enabled === 'true',
            url: input.currency_api_url.trim(),
            fallback_urls: input.currency_api_fallback_urls
              .map((u) => u.trim())
              .filter((u) => u.length > 0),
            except:
              scopes?.currencyApiOnly === undefined
                ? currencyApiExcept
                : undefined,
          },
          blockchain: {
            enabled: input.blockchain_enabled === 'true',
            url: input.blockchain_url.trim(),
          },
          eltoque: {
            enabled: eltoqueEnabled,
            url: input.eltoque_url.trim(),
            token: input.eltoque_token?.trim() ?? '',
            only: keepEltoqueExcept ? undefined : eltoqueOnly,
            except: keepEltoqueExcept ? scopes?.eltoqueExcept : undefined,
          },
          nostr: {
            enabled: nostrEnabled,
            trusted_nodes: trustedNodes,
          },
          pegged: {
            enabled: input.pegged_enabled === 'true',
            // Form saves preserve the quoted set and write one scope key.
            only: PEGGED_CODES.every((code) =>
              input.pegged_codes.includes(code),
            )
              ? undefined
              : input.pegged_codes,
            except: undefined,
          },
        },
      },
    })
  },
)
