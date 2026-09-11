import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { daemon_settings } from '../fileModels/settings'

export const current = VersionInfo.of({
  version: '0.18.7:0',
  releaseNotes: {
    en_US: `Updated Mostro to 0.18.7.

**Features**
- Caps in-flight payouts node-wide and per destination, and bounds the total timelock of a payout route — these are now on **Configure Lightning Node Settings**
- Operators can cancel pre-trade orders through the local admin RPC

**Fixes**
- Info events advertised the hold window correctly; user payout invoices are capped at 144 blocks; several drain-counter and admin-cancel hold-invoice fixes

**StartOS**
- Wire transport is pinned to nip44 (protocol v2); gift-wrap is not available
- \`allow_node_change\` stays off (disaster recovery only) and is not a settings toggle
- New installs default to three relays (\`wss://relay.mostro.network\`, \`wss://mostro-p2p.tech\`, \`wss://relay.shadowbip.com\`) and accept all fiat currencies
- **Configure Price Providers** covers the multi-source \`[price]\` block (El Toque and Nostr prices stay off until you add a token or trusted node)
- Cashu escrow is not packaged; this service still requires LND

Full notes: https://github.com/MostroP2P/mostro/releases/tag/v0.18.7`,
    es_ES: `Mostro actualizado a 0.18.7.

**Novedades**
- Limita los pagos en vuelo en todo el nodo y por destino, y acota el timelock total de una ruta de pago — ahora están en **Configurar nodo Lightning**
- Los operadores pueden cancelar órdenes pre-trade por el RPC de administración local

**Correcciones**
- Los eventos de información anuncian bien la ventana de hold; las facturas de pago del usuario se limitan a 144 bloques; varios arreglos de contadores de drenaje y de cancelación administrativa de hold-invoices

**StartOS**
- El transporte está fijado a nip44 (protocolo v2); gift-wrap no está disponible
- \`allow_node_change\` permanece desactivado (solo recuperación de desastres) y no es un ajuste de la interfaz
- Las instalaciones nuevas usan tres relays (\`wss://relay.mostro.network\`, \`wss://mostro-p2p.tech\`, \`wss://relay.shadowbip.com\`) y aceptan todas las monedas fiat
- **Configurar proveedores de precio** cubre el bloque multi-fuente \`[price]\` (El Toque y los precios Nostr siguen apagados hasta que añadas un token o un nodo de confianza)
- El escrow Cashu no está empaquetado; este servicio sigue requiriendo LND

Notas completas: https://github.com/MostroP2P/mostro/releases/tag/v0.18.7`,
    de_DE: `Mostro auf 0.18.7 aktualisiert.

**Funktionen**
- Begrenzt laufende Auszahlungen knotenweit und pro Ziel und begrenzt den gesamten Timelock einer Auszahlungsroute — jetzt unter **Lightning-Knoten konfigurieren**
- Betreiber können Pre-Trade-Orders über die lokale Admin-RPC stornieren

**Korrekturen**
- Info-Events melden das Hold-Fenster korrekt; Nutzer-Auszahlungsrechnungen sind auf 144 Blöcke begrenzt; mehrere Drain-Zähler- und Admin-Cancel-Hold-Invoice-Korrekturen

**StartOS**
- Der Drahttransport ist auf nip44 (Protokoll v2) festgesetzt; gift-wrap ist nicht verfügbar
- \`allow_node_change\` bleibt aus (nur Disaster Recovery) und ist kein Einstellungs-Schalter
- Neue Installationen nutzen drei Relays (\`wss://relay.mostro.network\`, \`wss://mostro-p2p.tech\`, \`wss://relay.shadowbip.com\`) und akzeptieren alle Fiat-Währungen
- **Preisanbieter konfigurieren** deckt den Multi-Source-\`[price]\`-Block ab (El Toque und Nostr-Preise bleiben aus, bis du ein Token oder einen vertrauenswürdigen Knoten hinzufügst)
- Cashu-Escrow ist nicht paketiert; dieser Dienst benötigt weiterhin LND

Vollständige Hinweise: https://github.com/MostroP2P/mostro/releases/tag/v0.18.7`,
    pl_PL: `Zaktualizowano Mostro do 0.18.7.

**Funkcje**
- Limituje płatności w locie w całym węźle i per cel oraz ogranicza całkowity timelock trasy wypłaty — teraz w **Konfiguruj węzeł Lightning**
- Operatorzy mogą anulować zlecenia przed transzą przez lokalne RPC administracyjne

**Poprawki**
- Zdarzenia info poprawnie ogłaszają okno hold; faktury wypłat użytkownika są ograniczone do 144 bloków; kilka poprawek liczników drenowania i administracyjnego anulowania hold-invoice

**StartOS**
- Transport jest przypięty do nip44 (protokół v2); gift-wrap jest niedostępny
- \`allow_node_change\` pozostaje wyłączone (tylko odzyskiwanie po awarii) i nie jest przełącznikiem w ustawieniach
- Nowe instalacje mają trzy przekaźniki (\`wss://relay.mostro.network\`, \`wss://mostro-p2p.tech\`, \`wss://relay.shadowbip.com\`) i akceptują wszystkie waluty fiat
- **Konfiguruj dostawców cen** obejmuje wieloźródłowy blok \`[price]\` (El Toque i ceny Nostr pozostają wyłączone, dopóki nie dodasz tokenu lub zaufanego węzła)
- Escrow Cashu nie jest spakowany; ta usługa nadal wymaga LND

Pełne uwagi: https://github.com/MostroP2P/mostro/releases/tag/v0.18.7`,
    fr_FR: `Mostro mis à jour vers 0.18.7.

**Fonctionnalités**
- Plafonne les paiements en vol à l’échelle du nœud et par destination, et borne le timelock total d’une route de paiement — désormais dans **Configurer le nœud Lightning**
- Les opérateurs peuvent annuler des ordres pre-trade via le RPC d’administration local

**Corrections**
- Les événements d’info annoncent correctement la fenêtre de hold ; les factures de paiement utilisateur sont plafonnées à 144 blocs ; plusieurs correctifs des compteurs de drain et de l’annulation admin des hold-invoices

**StartOS**
- Le transport est figé sur nip44 (protocole v2) ; gift-wrap n’est pas disponible
- \`allow_node_change\` reste désactivé (reprise après sinistre uniquement) et n’est pas un interrupteur des réglages
- Les nouvelles installations utilisent trois relais (\`wss://relay.mostro.network\`, \`wss://mostro-p2p.tech\`, \`wss://relay.shadowbip.com\`) et acceptent toutes les devises fiat
- **Configurer les fournisseurs de prix** couvre le bloc multi-sources \`[price]\` (El Toque et les prix Nostr restent désactivés jusqu’à ce que vous ajoutiez un jeton ou un nœud de confiance)
- L’escrow Cashu n’est pas empaqueté ; ce service exige toujours LND

Notes complètes : https://github.com/MostroP2P/mostro/releases/tag/v0.18.7`,
  },
  migrations: {
    up: async ({ effects }) => {
      // Fill new 0.18.7 keys from .catch() defaults. Invalid leftover
      // transport = gift-wrap is repaired to nip44.
      await daemon_settings.merge(effects, {})
    },
    down: IMPOSSIBLE,
  },
})
