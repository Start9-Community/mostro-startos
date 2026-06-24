import { daemon_settings } from '../../fileModels/settings'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

const { InputSpec, Value, List } = sdk

export const inputSpec = InputSpec.of({
  relays: Value.list(
    List.text(
      {
        name: i18n('Nostr Relays'),
        description: i18n(
          'Nostr relay URLs that Mostro publishes orders to and reads from. At least one is required.',
        ),
        default: ['wss://relay.mostro.network'],
        minLength: 1,
      },
      {
        placeholder: 'wss://relay.mostro.network',
        patterns: [
          {
            regex: '^wss?://\\S+$',
            description: i18n('Must be a ws:// or wss:// relay URL'),
          },
        ],
      },
    ),
  ),
})

export const nostrRelays = sdk.Action.withInput(
  'nostr-relays',

  async () => ({
    name: i18n('Set Nostr Relays'),
    description: i18n(
      'Configure the Nostr relays Mostro publishes to and reads from',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Nostr Settings'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const relays = await daemon_settings.read((s) => s?.nostr?.relays).once()
    return { relays: relays ?? ['wss://relay.mostro.network'] }
  },

  async ({ effects, input }) => {
    // The list's per-item `patterns` are enforced in the UI only, not on
    // programmatic submits — so validate the relay URLs here too before they
    // reach the daemon's config.
    const relays = input.relays.map((r) => r.trim()).filter((r) => r.length > 0)
    const invalid = relays.filter((r) => !/^wss?:\/\/\S+$/.test(r))
    if (invalid.length > 0) {
      throw new Error(
        `Invalid relay URL(s): ${invalid.join(', ')}. Each relay must be a ws:// or wss:// URL.`,
      )
    }
    if (relays.length === 0) {
      throw new Error('At least one Nostr relay URL is required.')
    }

    await daemon_settings.merge(effects, {
      nostr: { relays },
    })
  },
)
