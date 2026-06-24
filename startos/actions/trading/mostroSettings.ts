import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value } = sdk

const DEFAULT_FIAT_CURRENCIES = ['USD', 'EUR', 'ARS', 'CUP']

function parseFiatCurrencyList(value: string): string[] {
  if (!value?.trim()) {
    return []
  }

  return value
    .split(',')
    .map((currency) => currency.trim().toUpperCase())
    .filter((currency) => currency.length > 0)
}

export const inputSpec = InputSpec.of({
  name: Value.text({
    name: i18n('Mostro Name'),
    description: i18n(
      'Human-readable name for this Mostro instance (NIP-01 kind 0)',
    ),
    placeholder: 'Mostro',
    default: '',
    required: false,
  }),
  about: Value.text({
    name: i18n('About'),
    description: i18n('Short description of this Mostro instance'),
    placeholder:
      'A peer-to-peer Bitcoin trading daemon over the Lightning Network',
    default: '',
    required: false,
  }),
  picture: Value.text({
    name: i18n('Avatar URL'),
    description: i18n(
      'URL to avatar image (square, max 128x128px recommended)',
    ),
    placeholder: 'https://mostro.network/mostro-avatar.png',
    default: '',
    required: false,
  }),
  website: Value.text({
    name: i18n('Website URL'),
    description: i18n('Operator website URL'),
    placeholder: 'https://mostro.network',
    default: '',
    required: false,
  }),
  fee: Value.number({
    name: i18n('Mostro Fee'),
    description: i18n('Mostro fee percentage'),
    default: 0,
    required: true,
    integer: false,
    min: 0,
    max: 1,
  }),
  max_routing_fee: Value.number({
    name: i18n('Max Routing Fee'),
    description: i18n(
      'Max routing fee that we want to pay to the network (0.002 = 0.2%)',
    ),
    default: 0.002,
    required: true,
    integer: false,
    min: 0,
    max: 0.1,
  }),
  max_order_amount: Value.number({
    name: i18n('Max Order Amount'),
    description: i18n('Max order amount in satoshis'),
    default: 1000000,
    required: true,
    integer: true,
    min: 1000,
    max: 100000000,
  }),
  min_payment_amount: Value.number({
    name: i18n('Min Payment Amount'),
    description: i18n('Minimum amount for a payment in satoshis'),
    default: 100,
    required: true,
    integer: true,
    min: 1,
    max: 10000,
  }),
  expiration_hours: Value.number({
    name: i18n('Expiration Hours'),
    description: i18n('Default expiration time for orders in hours'),
    default: 24,
    required: true,
    integer: true,
    min: 1,
    max: 168,
  }),
  max_expiration_days: Value.number({
    name: i18n('Max Expiration Days'),
    description: i18n('Maximum expiration days for an order'),
    default: 15,
    required: true,
    integer: true,
    min: 1,
    max: 365,
  }),
  expiration_seconds: Value.number({
    name: i18n('Expiration Seconds'),
    description: i18n('Expiration of pending orders in seconds'),
    default: 900,
    required: true,
    integer: true,
    min: 60,
    max: 3600,
  }),
  user_rates_sent_interval_seconds: Value.number({
    name: i18n('User Rates Interval'),
    description: i18n('User rate events scheduled time interval in seconds'),
    default: 3600,
    required: true,
    integer: true,
    min: 300,
    max: 86400,
  }),
  publish_relays_interval: Value.number({
    name: i18n('Publish Relays Interval'),
    description: i18n('Relay list event time interval in seconds'),
    default: 60,
    required: true,
    integer: true,
    min: 10,
    max: 3600,
  }),
  pow: Value.number({
    name: i18n('Proof of Work'),
    description: i18n('Requested proof of work difficulty'),
    default: 0,
    required: true,
    integer: true,
    min: 0,
    max: 40,
  }),
  transport: Value.select({
    name: i18n('Wire Transport'),
    description: i18n(
      'Protocol transport: gift-wrap (v1, deprecated) or nip44 (v2)',
    ),
    default: 'gift-wrap',
    values: {
      'gift-wrap': i18n('gift-wrap (protocol v1)'),
      nip44: i18n('nip44 (protocol v2)'),
    },
  }),
  publish_mostro_info_interval: Value.number({
    name: i18n('Publish Mostro Info Interval'),
    description: i18n('Publish mostro info interval in seconds'),
    default: 300,
    required: true,
    integer: true,
    min: 60,
    max: 3600,
  }),
  bitcoin_price_api_url: Value.text({
    name: i18n('Bitcoin Price API URL'),
    description: i18n(
      'Legacy Bitcoin price API base URL (prefer Price Provider settings when configured)',
    ),
    placeholder: 'https://api.yadio.io',
    default: 'https://api.yadio.io',
    required: true,
  }),
  fiat_currencies_accepted: Value.text({
    name: i18n('Fiat Currencies Accepted'),
    description: i18n(
      'Comma-separated fiat currency codes (e.g., USD,EUR,ARS,CUP). Leave empty to accept all fiat currencies.',
    ),
    placeholder: 'USD,EUR,ARS,CUP',
    default: 'USD,EUR,ARS,CUP',
    required: false,
  }),
  max_orders_per_response: Value.number({
    name: i18n('Max Orders Per Response'),
    description: i18n('Maximum orders per response in orders action'),
    default: 10,
    required: true,
    integer: true,
    min: 1,
    max: 100,
  }),
  dev_fee_percentage: Value.number({
    name: i18n('Development Fee Percentage'),
    description: i18n(
      'Percentage of Mostro fee sent to development fund (0.30 means 30% of the Mostro fee)',
    ),
    default: 0.3,
    required: true,
    integer: false,
    min: 0,
    max: 1,
  }),
})

export const mostroSettings = sdk.Action.withInput(
  'mostro-settings',

  async () => ({
    name: i18n('Configure Mostro Settings'),
    description: i18n('Configure Mostro trading and business logic settings'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Trading'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const mostroConfig = await daemon_settings.read((s) => s?.mostro).once()

    return {
      name: mostroConfig?.name ?? '',
      about: mostroConfig?.about ?? '',
      picture: mostroConfig?.picture ?? '',
      website: mostroConfig?.website ?? '',
      fee: mostroConfig?.fee ?? 0,
      max_routing_fee: mostroConfig?.max_routing_fee ?? 0.002,
      max_order_amount: mostroConfig?.max_order_amount ?? 1_000_000,
      min_payment_amount: mostroConfig?.min_payment_amount ?? 100,
      expiration_hours: mostroConfig?.expiration_hours ?? 24,
      max_expiration_days: mostroConfig?.max_expiration_days ?? 15,
      expiration_seconds: mostroConfig?.expiration_seconds ?? 900,
      user_rates_sent_interval_seconds:
        mostroConfig?.user_rates_sent_interval_seconds ?? 3600,
      publish_relays_interval: mostroConfig?.publish_relays_interval ?? 60,
      pow: mostroConfig?.pow ?? 0,
      transport: mostroConfig?.transport ?? 'gift-wrap',
      publish_mostro_info_interval:
        mostroConfig?.publish_mostro_info_interval ?? 300,
      bitcoin_price_api_url:
        mostroConfig?.bitcoin_price_api_url ?? 'https://api.yadio.io',
      fiat_currencies_accepted: (
        mostroConfig?.fiat_currencies_accepted ?? DEFAULT_FIAT_CURRENCIES
      ).join(','),
      max_orders_per_response: mostroConfig?.max_orders_per_response ?? 10,
      dev_fee_percentage: mostroConfig?.dev_fee_percentage ?? 0.3,
    }
  },

  async ({ effects, input }) => {
    await daemon_settings.merge(effects, {
      mostro: {
        name: input.name ?? '',
        about: input.about ?? '',
        picture: input.picture ?? '',
        website: input.website ?? '',
        fee: input.fee,
        max_routing_fee: input.max_routing_fee,
        max_order_amount: input.max_order_amount,
        min_payment_amount: input.min_payment_amount,
        expiration_hours: input.expiration_hours,
        max_expiration_days: input.max_expiration_days,
        expiration_seconds: input.expiration_seconds,
        user_rates_sent_interval_seconds:
          input.user_rates_sent_interval_seconds,
        publish_relays_interval: input.publish_relays_interval,
        pow: input.pow,
        transport: input.transport,
        publish_mostro_info_interval: input.publish_mostro_info_interval,
        bitcoin_price_api_url: input.bitcoin_price_api_url,
        fiat_currencies_accepted: parseFiatCurrencyList(
          input.fiat_currencies_accepted ?? '',
        ),
        max_orders_per_response: input.max_orders_per_response,
        dev_fee_percentage: input.dev_fee_percentage,
      },
    })
  },
)
