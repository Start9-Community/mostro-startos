import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  enabled: Value.select({
    name: i18n('Anti-Abuse Bond Enabled'),
    description: i18n(
      'Require a Lightning hold-invoice bond from takers and/or makers (opt-in)',
    ),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  amount_pct: Value.number({
    name: i18n('Bond Amount Percentage'),
    description: i18n(
      'Bond = max(amount_pct × order_amount_sats, base_amount_sats). Unitless fraction (0.01 = 1%)',
    ),
    default: 0.01,
    required: true,
    integer: false,
    min: 0,
    max: 1,
  }),
  base_amount_sats: Value.number({
    name: i18n('Bond Base Amount (sats)'),
    description: i18n('Minimum bond floor in satoshis'),
    default: 1000,
    required: true,
    integer: true,
    min: 1,
    max: 1_000_000,
  }),
  apply_to: Value.select({
    name: i18n('Apply Bond To'),
    description: i18n('Which order side must post the bond'),
    default: 'take',
    values: {
      take: i18n('Takers only'),
      make: i18n('Makers only'),
      both: i18n('Both takers and makers'),
    },
  }),
  slash_on_waiting_timeout: Value.select({
    name: i18n('Slash On Waiting Timeout'),
    description: i18n('Slash the bond when a waiting timeout occurs'),
    default: 'false',
    values: {
      true: i18n('Enabled'),
      false: i18n('Disabled'),
    },
  }),
  slash_node_share_pct: Value.number({
    name: i18n('Node Slash Share'),
    description: i18n(
      'Fraction of a slashed bond retained by this node (remainder goes to counterparty)',
    ),
    default: 0.5,
    required: true,
    integer: false,
    min: 0,
    max: 1,
  }),
  payout_invoice_window_seconds: Value.number({
    name: i18n('Payout Invoice Window'),
    description: i18n(
      'Seconds the winner has to submit a bolt11 invoice for payout',
    ),
    default: 300,
    required: true,
    integer: true,
    min: 60,
    max: 3600,
  }),
  payout_max_retries: Value.number({
    name: i18n('Payout Max Retries'),
    description: i18n('Maximum payout retry attempts'),
    default: 5,
    required: true,
    integer: true,
    min: 1,
    max: 20,
  }),
  payout_claim_window_days: Value.number({
    name: i18n('Payout Claim Window (days)'),
    description: i18n(
      'Days the winner has to claim their share; after this the bond is forfeited',
    ),
    default: 15,
    required: true,
    integer: true,
    min: 1,
    max: 365,
  }),
})

export const antiAbuseBondSettings = sdk.Action.withInput(
  'anti-abuse-bond-settings',

  async () => ({
    name: i18n('Configure Anti-Abuse Bond'),
    description: i18n(
      'Configure Lightning hold-invoice bonds to deter abusive takers and makers',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Trading'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const bond = await daemon_settings.read((s) => s?.anti_abuse_bond).once()

    return {
      enabled: bond?.enabled ? ('true' as const) : ('false' as const),
      amount_pct: bond?.amount_pct ?? 0.01,
      base_amount_sats: bond?.base_amount_sats ?? 1000,
      apply_to: bond?.apply_to ?? 'take',
      slash_on_waiting_timeout: bond?.slash_on_waiting_timeout
        ? ('true' as const)
        : ('false' as const),
      slash_node_share_pct: bond?.slash_node_share_pct ?? 0.5,
      payout_invoice_window_seconds: bond?.payout_invoice_window_seconds ?? 300,
      payout_max_retries: bond?.payout_max_retries ?? 5,
      payout_claim_window_days: bond?.payout_claim_window_days ?? 15,
    }
  },

  async ({ effects, input }) => {
    await daemon_settings.merge(effects, {
      anti_abuse_bond: {
        enabled: input.enabled === 'true',
        amount_pct: input.amount_pct,
        base_amount_sats: input.base_amount_sats,
        apply_to: input.apply_to,
        slash_on_waiting_timeout: input.slash_on_waiting_timeout === 'true',
        slash_node_share_pct: input.slash_node_share_pct,
        payout_invoice_window_seconds: input.payout_invoice_window_seconds,
        payout_max_retries: input.payout_max_retries,
        payout_claim_window_days: input.payout_claim_window_days,
      },
    })
  },
)
