import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

/**
 * Nostr validation utilities
 */

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const v of values) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= GEN[i]
    }
  }
  return chk
}

function bech32HrpExpand(hrp: string): number[] {
  const high: number[] = []
  const low: number[] = []
  for (let i = 0; i < hrp.length; i++) {
    high.push(hrp.charCodeAt(i) >> 5)
    low.push(hrp.charCodeAt(i) & 31)
  }
  return [...high, 0, ...low]
}

/**
 * Decode a bech32 string (BIP-173), verifying the checksum. Returns the
 * human-readable part and the decoded 8-bit payload, or null if the string is
 * not well-formed bech32 (bad charset, bad checksum, or invalid padding).
 */
function bech32Decode(str: string): { hrp: string; bytes: number[] } | null {
  if (str !== str.toLowerCase() && str !== str.toUpperCase()) return null
  str = str.toLowerCase()
  const pos = str.lastIndexOf('1')
  if (pos < 1 || pos + 7 > str.length) return null
  const hrp = str.slice(0, pos)
  const data: number[] = []
  for (const c of str.slice(pos + 1)) {
    const d = BECH32_CHARSET.indexOf(c)
    if (d === -1) return null
    data.push(d)
  }
  if (bech32Polymod([...bech32HrpExpand(hrp), ...data]) !== 1) return null

  let acc = 0
  let bits = 0
  const bytes: number[] = []
  for (const v of data.slice(0, -6)) {
    acc = (acc << 5) | v
    bits += 5
    if (bits >= 8) {
      bits -= 8
      bytes.push((acc >> bits) & 0xff)
    }
  }
  if (bits >= 5 || (acc & ((1 << bits) - 1)) !== 0) return null // bad padding
  return { hrp, bytes }
}

/**
 * Validates a Nostr private key in nsec format. Verifies the bech32 checksum
 * and that it decodes to a 32-byte key — so a mistyped nsec is rejected at the
 * action instead of crash-looping the daemon with "Invalid secret key".
 */
export function isValidNsec(nsec: string): boolean {
  if (typeof nsec !== 'string') return false
  const decoded = bech32Decode(nsec.trim())
  return (
    decoded !== null && decoded.hrp === 'nsec' && decoded.bytes.length === 32
  )
}

/** Read-only mount point for the LND dependency's data volume. */
export const lndMount = '/mnt/lnd'

/**
 * LND TLS cert + admin macaroon, read directly off LND's idmapped readonly
 * dependency mount (no copy). Main reconciles `lnd_grpc_host` to LND's gRPC
 * bridge address reactively (see `bridgeAddress`); until it resolves the field
 * is left unwritten rather than pointed at a placeholder.
 */
export const lndCredPaths = {
  cert: `${lndMount}/tls.cert`,
  macaroon: `${lndMount}/data/chain/bitcoin/mainnet/admin.macaroon`,
} as const

/**
 * Bridge address (`10.0.3.1:<assigned external port>`) of a dependency's
 * binding, as a minimal reactive value. Chain `.const()` in main: the mapped
 * string only changes when the address itself does, so main restarts exactly
 * on dependency install/uninstall/port-change and never on dependency
 * updates. Chain `.once()` in an action context. `fallbackPort` keeps the
 * value non-null while the dependency is absent — sanctioned only for tor's
 * allocator-guaranteed SOCKS 9050. Drop-in for the planned SDK
 * `sdk.host.getBridgeAddress` helper.
 */
export function bridgeAddress(
  effects: T.Effects,
  opts: {
    packageId: string
    hostId: string
    internalPort: number
    fallbackPort: number
  },
): { const(): Promise<string>; once(): Promise<string> }
export function bridgeAddress(
  effects: T.Effects,
  opts: { packageId: string; hostId: string; internalPort: number },
): { const(): Promise<string | null>; once(): Promise<string | null> }
export function bridgeAddress(
  effects: T.Effects,
  opts: {
    packageId: string
    hostId: string
    internalPort: number
    fallbackPort?: number
  },
) {
  const watchable = async () => {
    const osIp = await sdk.getOsIp(effects)
    return sdk.host.get(
      effects,
      { packageId: opts.packageId, hostId: opts.hostId },
      (host) => {
        const port =
          host?.bindings[opts.internalPort]?.net.assignedPort ??
          opts.fallbackPort
        if (port == null) return null
        return `${osIp}:${port}`
      },
    )
  }
  return {
    const: async () => (await watchable()).const(),
    once: async () => (await watchable()).once(),
  }
}
