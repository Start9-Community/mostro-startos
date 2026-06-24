import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { requireNostrConfig } from './requireNostrConfig'
import { seedDefaults } from './seedDefaults'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  seedDefaults,
  requireNostrConfig,
)

export const uninit = sdk.setupUninit(versionGraph)
