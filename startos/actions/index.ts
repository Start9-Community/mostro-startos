import { sdk } from '../sdk'
import { lnSettings } from './lightning/lnSettings'
import { nostrKey } from './nostr-settings/nostrKey'
import { nostrRelays } from './nostr-settings/nostrRelays'
import { antiAbuseBondSettings } from './trading/antiAbuseBondSettings'
import { expirationSettings } from './trading/expirationSettings'
import { mostroSettings } from './trading/mostroSettings'

export const actions = sdk.Actions.of()
  .addAction(nostrKey)
  .addAction(nostrRelays)
  .addAction(lnSettings)
  .addAction(mostroSettings)
  .addAction(expirationSettings)
  .addAction(antiAbuseBondSettings)
