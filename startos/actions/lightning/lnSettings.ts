import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { lndCredPaths } from '../../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  invoice_expiration_window: Value.number({
    name: i18n('Invoice Expiration Window'),
    description: i18n(
      'Lightning invoices sent by the buyer to Mostro should have at least this expiration time in seconds',
    ),
    default: 3600,
    required: true,
    integer: true,
    min: 300,
    max: 86400,
  }),
  hold_invoice_cltv_delta: Value.number({
    name: i18n('Hold Invoice CLTV Delta'),
    description: i18n('Hold invoice cltv delta (expiration time in blocks)'),
    default: 144,
    required: true,
    integer: true,
    min: 1,
    max: 1000,
  }),
  hold_invoice_expiration_window: Value.number({
    name: i18n('Hold Invoice Expiration Window'),
    description: i18n(
      'This is the time that a taker has to pay the invoice (seller) or to add a new invoice (buyer), in seconds',
    ),
    default: 300,
    required: true,
    integer: true,
    min: 60,
    max: 3600,
  }),
  payment_attempts: Value.number({
    name: i18n('Payment Attempts'),
    description: i18n('Retries for failed payments'),
    default: 3,
    required: true,
    integer: true,
    min: 1,
    max: 10,
  }),
  payment_retries_interval: Value.number({
    name: i18n('Payment Retries Interval'),
    description: i18n('Retries interval for failed payments in seconds'),
    default: 60,
    required: true,
    integer: true,
    min: 10,
    max: 300,
  }),
  max_final_cltv_expiry_delta: Value.number({
    name: i18n('Max Final CLTV Expiry'),
    description: i18n(
      'Maximum CLTV expiry (blocks) accepted on a user payout invoice. 144 is the top of what real wallets ask for. Do not set 0 — that rejects every invoice.',
    ),
    default: 144,
    required: true,
    integer: true,
    min: 18,
    max: 2016,
  }),
  escrow_deadline_margin_blocks: Value.number({
    name: i18n('Escrow Deadline Margin'),
    description: i18n(
      "Safety margin (blocks) before the hold invoice's CLTV horizon. Mostro cancels or opens a dispute while escrow still exists. Must exceed your node's holdexpirydelta (LND default 12).",
    ),
    default: 24,
    required: true,
    integer: true,
    min: 12,
    max: 2016,
  }),
  max_inflight_payouts: Value.number({
    name: i18n('Max In-Flight Payouts'),
    description: i18n(
      'Ceiling on payments the node may have in flight. Extra payouts wait their turn; they are not dropped. 0 disables the gate.',
    ),
    default: 100,
    required: true,
    integer: true,
    min: 0,
    max: 1000,
  }),
  max_inflight_payouts_per_destination: Value.number({
    name: i18n('Max In-Flight Payouts Per Destination'),
    description: i18n(
      'Same ceiling per payout destination pubkey. 0 disables this arm.',
    ),
    default: 10,
    required: true,
    integer: true,
    min: 0,
    max: 100,
  }),
  payment_cltv_limit: Value.number({
    name: i18n('Payment Route CLTV Limit'),
    description: i18n(
      'Upper bound (blocks) on the total timelock of a payout route. 1008 is the default. 0 sends no ceiling and lets LND apply its own.',
    ),
    default: 1008,
    required: true,
    integer: true,
    min: 0,
    max: 2016,
  }),
})

export const lnSettings = sdk.Action.withInput(
  'ln-settings',

  async () => ({
    name: i18n('Configure Lightning Node Settings'),
    description: i18n(
      'Configure Lightning node connection settings for Mostro',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Lightning'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const lightningConfig = await daemon_settings
      .read((s) => s?.lightning)
      .once()

    return {
      invoice_expiration_window:
        lightningConfig?.invoice_expiration_window ?? 3600,
      hold_invoice_cltv_delta: lightningConfig?.hold_invoice_cltv_delta ?? 144,
      hold_invoice_expiration_window:
        lightningConfig?.hold_invoice_expiration_window ?? 300,
      payment_attempts: lightningConfig?.payment_attempts ?? 3,
      payment_retries_interval: lightningConfig?.payment_retries_interval ?? 60,
      max_final_cltv_expiry_delta:
        lightningConfig?.max_final_cltv_expiry_delta ?? 144,
      escrow_deadline_margin_blocks:
        lightningConfig?.escrow_deadline_margin_blocks ?? 24,
      max_inflight_payouts: lightningConfig?.max_inflight_payouts ?? 100,
      max_inflight_payouts_per_destination:
        lightningConfig?.max_inflight_payouts_per_destination ?? 10,
      payment_cltv_limit: lightningConfig?.payment_cltv_limit ?? 1008,
    }
  },

  async ({ effects, input }) => {
    await daemon_settings.merge(effects, {
      lightning: {
        lnd_cert_file: lndCredPaths.cert,
        lnd_macaroon_file: lndCredPaths.macaroon,
        // lnd_grpc_host is owned by main (resolved to LND's gRPC bridge URL).
        invoice_expiration_window: input.invoice_expiration_window,
        hold_invoice_cltv_delta: input.hold_invoice_cltv_delta,
        hold_invoice_expiration_window: input.hold_invoice_expiration_window,
        payment_attempts: input.payment_attempts,
        payment_retries_interval: input.payment_retries_interval,
        max_final_cltv_expiry_delta: input.max_final_cltv_expiry_delta,
        escrow_deadline_margin_blocks: input.escrow_deadline_margin_blocks,
        max_inflight_payouts: input.max_inflight_payouts,
        max_inflight_payouts_per_destination:
          input.max_inflight_payouts_per_destination,
        payment_cltv_limit: input.payment_cltv_limit,
      },
    })
  },
)
