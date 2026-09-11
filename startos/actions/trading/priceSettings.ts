import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value, List } = sdk

const DEFAULT_CURRENCY_API_FALLBACK = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1',
]

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
    min: 0,
    max: 50,
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
    description: i18n('Publish aggregated rates to Nostr (kind 30078)'),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  yadio_enabled: Value.select({
    name: i18n('Yadio Enabled'),
    description: i18n('Use Yadio as a price source'),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  yadio_url: Value.text({
    name: i18n('Yadio URL'),
    description: i18n('Yadio API base URL'),
    placeholder: 'https://api.yadio.io',
    default: 'https://api.yadio.io',
    required: true,
  }),
  coingecko_enabled: Value.select({
    name: i18n('CoinGecko Enabled'),
    description: i18n('Use CoinGecko as a price source'),
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
    description: i18n('Optional CoinGecko demo/pro API key'),
    placeholder: 'CG-xxxx',
    default: '',
    required: false,
    masked: true,
  }),
  currency_api_enabled: Value.select({
    name: i18n('Currency API Enabled'),
    description: i18n(
      'Use the keyless currency-api CDN (300+ currencies; CUP/MLC excluded by default)',
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
        default: ['CUP', 'MLC'],
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
      'Use Blockchain.info as a price source (~28 major fiats)',
    ),
    default: 'true',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  blockchain_url: Value.text({
    name: i18n('Blockchain.info URL'),
    description: i18n('Blockchain.info API base URL'),
    placeholder: 'https://blockchain.info',
    default: 'https://blockchain.info',
    required: true,
  }),
  eltoque_enabled: Value.select({
    name: i18n('El Toque Enabled'),
    description: i18n(
      'Informal-market CUP/MLC via El Toque. Requires a token. Keep off until you have confirmed the API.',
    ),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  eltoque_url: Value.text({
    name: i18n('El Toque URL'),
    description: i18n('El Toque API base URL'),
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
        default: ['CUP', 'MLC'],
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
      'Subscribe to rates published by trusted Mostro nodes over Nostr instead of an HTTP API',
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
      provider_timeout_seconds: price?.provider_timeout_seconds ?? 10,
      provider_failure_threshold: price?.provider_failure_threshold ?? 3,
      provider_failure_cooldown_seconds:
        price?.provider_failure_cooldown_seconds ?? 120,
      publish_to_nostr: asEnabled(price?.publish_to_nostr, true),
      yadio_enabled: asEnabled(providers?.yadio?.enabled, true),
      yadio_url: providers?.yadio?.url ?? 'https://api.yadio.io',
      coingecko_enabled: asEnabled(providers?.coingecko?.enabled, true),
      coingecko_url:
        providers?.coingecko?.url ?? 'https://api.coingecko.com/api/v3',
      coingecko_api_key: providers?.coingecko?.api_key ?? '',
      currency_api_enabled: asEnabled(providers?.currency_api?.enabled, true),
      currency_api_url:
        providers?.currency_api?.url ?? 'https://currency-api.pages.dev/v1',
      currency_api_fallback_urls:
        providers?.currency_api?.fallback_urls ?? DEFAULT_CURRENCY_API_FALLBACK,
      currency_api_except: providers?.currency_api?.except ?? ['CUP', 'MLC'],
      blockchain_enabled: asEnabled(providers?.blockchain?.enabled, true),
      blockchain_url: providers?.blockchain?.url ?? 'https://blockchain.info',
      eltoque_enabled: asEnabled(providers?.eltoque?.enabled, false),
      eltoque_url: providers?.eltoque?.url ?? 'https://tasas.eltoque.com',
      eltoque_token: providers?.eltoque?.token ?? '',
      eltoque_only: providers?.eltoque?.only ?? ['CUP', 'MLC'],
      nostr_enabled: asEnabled(providers?.nostr?.enabled, false),
      nostr_trusted_nodes: providers?.nostr?.trusted_nodes ?? [],
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

    await daemon_settings.merge(effects, {
      price: {
        update_interval_seconds: input.update_interval_seconds,
        max_price_staleness_seconds: input.max_price_staleness_seconds,
        outlier_threshold_pct: input.outlier_threshold_pct,
        provider_timeout_seconds: input.provider_timeout_seconds,
        provider_failure_threshold: input.provider_failure_threshold,
        provider_failure_cooldown_seconds:
          input.provider_failure_cooldown_seconds,
        publish_to_nostr: input.publish_to_nostr === 'true',
        providers: {
          yadio: {
            enabled: input.yadio_enabled === 'true',
            url: input.yadio_url.trim(),
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
            except: parseCodeList(input.currency_api_except),
          },
          blockchain: {
            enabled: input.blockchain_enabled === 'true',
            url: input.blockchain_url.trim(),
          },
          eltoque: {
            enabled: eltoqueEnabled,
            url: input.eltoque_url.trim(),
            token: input.eltoque_token?.trim() ?? '',
            only: parseCodeList(input.eltoque_only),
          },
          nostr: {
            enabled: nostrEnabled,
            trusted_nodes: trustedNodes,
          },
        },
      },
    })
  },
)
