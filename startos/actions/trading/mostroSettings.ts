import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { isValidNostrPubkey } from '../../utils'

const { InputSpec, Value } = sdk

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
      "Name published in this Mostro instance's Nostr profile (NIP-01 kind 0 metadata). Optional.",
    ),
    placeholder: 'Mostro',
    default: '',
    required: false,
  }),
  about: Value.text({
    name: i18n('About'),
    description: i18n(
      'Short description published in the same Nostr profile. Optional.',
    ),
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
    description: i18n(
      'Your website, published in the same Nostr profile. Optional.',
    ),
    placeholder: 'https://mostro.network',
    default: '',
    required: false,
  }),
  fee: Value.number({
    name: i18n('Mostro Fee'),
    description: i18n(
      'Fee charged on each trade, as a fraction of the order amount (0.006 = 0.6%), split equally between buyer and seller. 0 charges no fee.',
    ),
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
    description: i18n(
      "Smallest order, in satoshis, this node accepts; buyers' invoices must be at least this much too.",
    ),
    default: 100,
    required: true,
    integer: true,
    min: 1,
    max: 10000,
  }),
  expiration_hours: Value.number({
    name: i18n('Expiration Hours'),
    description: i18n(
      'Hours a new order stays published when its maker sets no expiration.',
    ),
    default: 24,
    required: true,
    integer: true,
    min: 1,
    max: 168,
  }),
  max_expiration_days: Value.number({
    name: i18n('Max Expiration Days'),
    description: i18n(
      'Longest a maker can keep an order published, in days; a later expiration is cut back to this.',
    ),
    default: 15,
    required: true,
    integer: true,
    min: 1,
    max: 365,
  }),
  expiration_seconds: Value.number({
    name: i18n('Expiration Seconds'),
    description: i18n(
      'Seconds a taken order waits for its next step (the seller paying the hold invoice, or the buyer sending an invoice) before Mostro cancels the take and republishes the order.',
    ),
    default: 900,
    required: true,
    integer: true,
    min: 60,
    max: 3600,
  }),
  user_rates_sent_interval_seconds: Value.number({
    name: i18n('User Rates Interval'),
    description: i18n(
      'How often, in seconds, Mostro publishes queued user rating events to the relays.',
    ),
    default: 3600,
    required: true,
    integer: true,
    min: 300,
    max: 86400,
  }),
  publish_relays_interval: Value.number({
    name: i18n('Publish Relays Interval'),
    description: i18n(
      'How often, in seconds, Mostro publishes its relay list event.',
    ),
    default: 60,
    required: true,
    integer: true,
    min: 10,
    max: 3600,
  }),
  pow: Value.number({
    name: i18n('Proof of Work'),
    description: i18n(
      'Proof-of-work difficulty, in leading zero bits, that events sent to Mostro must carry. 0 requires none.',
    ),
    default: 0,
    required: true,
    integer: true,
    min: 0,
    max: 40,
  }),
  publish_mostro_info_interval: Value.number({
    name: i18n('Publish Mostro Info Interval'),
    description: i18n(
      'How often, in seconds, Mostro republishes its info event, which announces its settings and limits to clients.',
    ),
    default: 300,
    required: true,
    integer: true,
    min: 60,
    max: 3600,
  }),
  fiat_currencies_accepted: Value.text({
    name: i18n('Fiat Currencies Accepted'),
    description: i18n(
      'Comma-separated fiat currency codes (e.g., USD,EUR,ARS,CUP). Leave empty to accept all fiat currencies.',
    ),
    placeholder: 'USD,EUR,ARS,CUP',
    default: '',
    required: false,
  }),
  max_orders_per_response: Value.number({
    name: i18n('Max Orders Per Response'),
    description: i18n(
      'Most orders a client can ask for in one orders request; a larger request is refused.',
    ),
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
    min: 0.1,
    max: 1,
  }),
  serbero_pubkey: Value.text({
    name: i18n('Serbero Pubkey'),
    description: i18n(
      'Optional pubkey (npub or hex) of your Serbero dispute assistant. Leave empty if you do not run one. Mostro registers it as a read-only solver and announces it in the info event; it refuses to start if the key is a write solver, a non-solver user, or the node itself',
    ),
    placeholder: 'npub1...',
    default: '',
    required: false,
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
      publish_mostro_info_interval:
        mostroConfig?.publish_mostro_info_interval ?? 300,
      fiat_currencies_accepted: (
        mostroConfig?.fiat_currencies_accepted ?? []
      ).join(','),
      max_orders_per_response: mostroConfig?.max_orders_per_response ?? 10,
      dev_fee_percentage: mostroConfig?.dev_fee_percentage ?? 0.3,
      serbero_pubkey: mostroConfig?.serbero_pubkey ?? '',
    }
  },

  async ({ effects, input }) => {
    const serberoPubkey = (input.serbero_pubkey ?? '').trim()
    if (serberoPubkey && !isValidNostrPubkey(serberoPubkey)) {
      throw new Error(i18n('Must be an npub or a 64-character hex public key'))
    }

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
        publish_mostro_info_interval: input.publish_mostro_info_interval,
        fiat_currencies_accepted: parseFiatCurrencyList(
          input.fiat_currencies_accepted ?? '',
        ),
        max_orders_per_response: input.max_orders_per_response,
        dev_fee_percentage: input.dev_fee_percentage,
        serbero_pubkey: serberoPubkey,
      },
    })
  },
)
