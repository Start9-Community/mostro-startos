import {
  daemon_settings,
  defaultMakerBondPaymentTimeoutSeconds,
} from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  enabled: Value.select({
    name: i18n('Anti-Abuse Bond Enabled'),
    description: i18n(
      '- Enabled: the sides chosen in Apply Bond To lock a Lightning hold-invoice bond when they take or create an order; it is released unless it is slashed\n- Disabled: no bond is required and nothing is slashed',
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
      'Bond size as a fraction of the order amount (0.01 = 1%). The bond is this share or Bond Base Amount, whichever is larger.',
    ),
    default: 0.01,
    required: true,
    integer: false,
    min: 0,
    max: 1,
  }),
  base_amount_sats: Value.number({
    name: i18n('Bond Base Amount (sats)'),
    description: i18n(
      'Smallest bond, in satoshis, so that small orders still carry a meaningful bond.',
    ),
    default: 1000,
    required: true,
    integer: true,
    min: 1,
    max: 1_000_000,
  }),
  apply_to: Value.select({
    name: i18n('Apply Bond To'),
    description: i18n(
      '- Takers only: the taker locks a bond when taking an order\n- Makers only: the maker locks a bond when creating an order\n- Both takers and makers: each side locks one',
    ),
    default: 'take',
    values: {
      take: i18n('Takers only'),
      make: i18n('Makers only'),
      both: i18n('Both takers and makers'),
    },
  }),
  slash_on_waiting_timeout: Value.select({
    name: i18n('Slash On Waiting Timeout'),
    description: i18n(
      '- Enabled: a bonded party who lets a trade step time out loses the bond; a cancel before the timeout still releases it\n- Disabled: a bond is slashed only when a dispute solver directs it',
    ),
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
    description: i18n(
      'How many times Mostro retries paying a slashed bond share once the winner has sent an invoice.',
    ),
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
  maker_bond_payment_timeout_seconds: Value.number({
    name: i18n('Maker Bond Payment Timeout'),
    description: i18n(
      'Seconds a maker has to pay the bond when bonds apply to makers. Past it the unpublished order expires.',
    ),
    default: defaultMakerBondPaymentTimeoutSeconds,
    required: true,
    integer: true,
    min: 1,
    max: 86400,
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
      maker_bond_payment_timeout_seconds:
        bond?.maker_bond_payment_timeout_seconds ??
        defaultMakerBondPaymentTimeoutSeconds,
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
        maker_bond_payment_timeout_seconds:
          input.maker_bond_payment_timeout_seconds,
      },
    })
  },
)
