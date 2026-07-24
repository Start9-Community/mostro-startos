import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.18.0:1',
  releaseNotes: {
    en_US:
      'Updated Mostro to 0.18.0. Adds wire protocol v2 (NIP-44 direct messaging) with anti-spam gates, a new El Toque fiat-cross price provider (CUP/MLC), dispute-slash notifications to the slashed party, and assorted fixes. Full notes: https://github.com/MostroP2P/mostro/releases/tag/v0.18.0. Also includes internal updates for start-sdk 2.0.',
    es_ES:
      'Mostro actualizado a 0.18.0. Añade el protocolo de transporte v2 (mensajería directa NIP-44) con controles anti-spam, un nuevo proveedor de precios cruzados en fiat El Toque (CUP/MLC), notificaciones de penalización por disputa a la parte penalizada y varias correcciones. Notas completas: https://github.com/MostroP2P/mostro/releases/tag/v0.18.0. También incluye actualizaciones internas para start-sdk 2.0.',
    de_DE:
      'Mostro auf 0.18.0 aktualisiert. Ergänzt das Wire-Protokoll v2 (NIP-44-Direktnachrichten) mit Anti-Spam-Schranken, einen neuen El-Toque-Fiat-Cross-Preisanbieter (CUP/MLC), Benachrichtigungen bei Streitfall-Slashing an die betroffene Partei sowie diverse Fehlerbehebungen. Vollständige Hinweise: https://github.com/MostroP2P/mostro/releases/tag/v0.18.0. Enthält außerdem interne Aktualisierungen für start-sdk 2.0.',
    pl_PL:
      'Zaktualizowano Mostro do 0.18.0. Dodano protokół transportowy v2 (bezpośrednie wiadomości NIP-44) z zabezpieczeniami antyspamowymi, nowego dostawcę kursów fiat El Toque (CUP/MLC), powiadomienia o karze za spór dla ukaranej strony oraz różne poprawki. Pełne informacje: https://github.com/MostroP2P/mostro/releases/tag/v0.18.0. Zawiera również wewnętrzne aktualizacje dla start-sdk 2.0.',
    fr_FR:
      'Mostro mis à jour vers 0.18.0. Ajoute le protocole de transport v2 (messagerie directe NIP-44) avec des barrières anti-spam, un nouveau fournisseur de prix fiat croisés El Toque (CUP/MLC), des notifications de pénalité de litige à la partie pénalisée, ainsi que divers correctifs. Notes complètes : https://github.com/MostroP2P/mostro/releases/tag/v0.18.0. Comprend également des mises à jour internes pour start-sdk 2.0.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
