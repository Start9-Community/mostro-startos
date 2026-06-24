import { sdk } from '../sdk'
import { daemon_settings } from '../fileModels/settings'

export const seedDefaults = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await daemon_settings.merge(effects, {})
})
