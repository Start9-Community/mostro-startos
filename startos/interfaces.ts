import { sdk } from './sdk'

// Mostro exposes no inbound network interface. It is a Nostr/Lightning client:
// it makes only outbound connections (to Nostr relays and to LND), and traders
// interact with it entirely through shared Nostr relays — never by connecting
// to this service directly. The admin gRPC is localhost-only (see main.ts).
export const setInterfaces = sdk.setupInterfaces(async () => [])
