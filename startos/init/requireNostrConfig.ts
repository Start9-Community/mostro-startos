import { nostrKey } from '../actions/nostr-settings/nostrKey'
import { nostrRelays } from '../actions/nostr-settings/nostrRelays'
import { daemon_settings } from '../fileModels/settings'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { isValidNsec } from '../utils'

/**
 * Mostro cannot run without a Nostr identity and at least one relay. On install
 * we read the actual config and raise a separate critical task for each piece
 * that is still missing, rather than tracking a derived "configured" flag.
 */
export const requireNostrConfig = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const nostr = await daemon_settings.read((s) => s?.nostr).once()

  if (!isValidNsec(nostr?.nsec_privkey ?? '')) {
    await sdk.action.createOwnTask(effects, nostrKey, 'critical', {
      reason: i18n('Mostro needs a Nostr key before it can run'),
    })
  }

  const relays = (nostr?.relays ?? []).filter((r) =>
    /^wss?:\/\/\S+$/.test(r.trim()),
  )
  if (relays.length === 0) {
    await sdk.action.createOwnTask(effects, nostrRelays, 'critical', {
      reason: i18n('Mostro needs at least one Nostr relay before it can run'),
    })
  }
})
