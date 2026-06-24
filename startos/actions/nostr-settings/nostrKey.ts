import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { isValidNsec } from '../../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  nsec_privkey: Value.text({
    name: i18n('Nostr Private Key'),
    description: i18n(
      'Nostr private key in nsec format (e.g., nsec1abc123...). Must start with "nsec1" and be a valid Bech32-encoded private key.',
    ),
    placeholder: 'nsec1...',
    default: '',
    required: true,
    masked: true,
  }),
})

export const nostrKey = sdk.Action.withInput(
  'nostr-key',

  async () => ({
    name: i18n('Set Nostr Key'),
    description: i18n(
      'Set the Nostr private key (nsec) that identifies this Mostro instance',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Nostr Settings'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const nsec = await daemon_settings
      .read((s) => s?.nostr?.nsec_privkey)
      .once()
    return { nsec_privkey: nsec ?? '' }
  },

  async ({ effects, input }) => {
    if (!isValidNsec(input.nsec_privkey)) {
      throw new Error(
        'Invalid Nostr private key format. Please provide a valid nsec1... key.',
      )
    }

    await daemon_settings.merge(effects, {
      nostr: { nsec_privkey: input.nsec_privkey },
    })
  },
)
