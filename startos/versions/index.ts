import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_0_18_7_0 } from './v0.18.7_0'
import { v_0_19_1_0 } from './v0.19.1_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_0_19_1_0, v_0_18_7_0],
})
