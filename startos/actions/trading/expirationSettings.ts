import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  order_days: Value.number({
    name: i18n('Order Event Retention'),
    description: i18n('Order events (kind 38383) — trades resolve quickly'),
    default: 30,
    required: true,
    integer: true,
    min: 1,
    max: 365,
  }),
  rating_days: Value.number({
    name: i18n('Rating Event Retention'),
    description: i18n(
      'Rating events (kind 38384) — reputation history retention',
    ),
    default: 90,
    required: true,
    integer: true,
    min: 1,
    max: 365,
  }),
  dispute_days: Value.number({
    name: i18n('Dispute Event Retention'),
    description: i18n(
      'Dispute events (kind 38386) — longer retention for auditing',
    ),
    default: 90,
    required: true,
    integer: true,
    min: 1,
    max: 365,
  }),
  fee_audit_days: Value.number({
    name: i18n('Fee Audit Event Retention'),
    description: i18n('Fee audit events (kind 8383) — annual transparency'),
    default: 365,
    required: true,
    integer: true,
    min: 1,
    max: 1095,
  }),
  dm_days: Value.number({
    name: i18n('Direct Message Retention'),
    description: i18n(
      'Protocol-v2 direct messages (kind 14) — trade lifetime plus dispute window',
    ),
    default: 30,
    required: true,
    integer: true,
    min: 1,
    max: 365,
  }),
})

export const expirationSettings = sdk.Action.withInput(
  'expiration-settings',

  async () => ({
    name: i18n('Configure Event Expiration'),
    description: i18n(
      'Configure how long different Nostr event types are retained',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Trading'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const expirationConfig = await daemon_settings
      .read((s) => s?.expiration)
      .once()

    return {
      order_days: expirationConfig?.order_days ?? 30,
      rating_days: expirationConfig?.rating_days ?? 90,
      dispute_days: expirationConfig?.dispute_days ?? 90,
      fee_audit_days: expirationConfig?.fee_audit_days ?? 365,
      dm_days: expirationConfig?.dm_days ?? 30,
    }
  },

  async ({ effects, input }) => {
    await daemon_settings.merge(effects, {
      expiration: {
        order_days: input.order_days,
        rating_days: input.rating_days,
        dispute_days: input.dispute_days,
        fee_audit_days: input.fee_audit_days,
        dm_days: input.dm_days,
      },
    })
  },
)
