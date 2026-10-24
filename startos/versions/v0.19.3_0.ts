import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { daemon_settings } from '../fileModels/settings'

export const v_0_19_3_0 = VersionInfo.of({
  version: '0.19.3:0',
  releaseNotes: {
    en_US: `Updated Mostro to 0.19.3 (includes 0.19.2).

**Features**
- **Configure Payer History** — optional payment-account history and declare-payer gating (off by default)
- Reputation import settings are modelled and kept disabled (upstream preview; do not enable until a later release handles import requests)
- Maker-chosen Cashu mint and Cashu info-event publish upstream — Cashu escrow is still not packaged here
- user-info answers with this node's own reputation
- Dev fees go only on LND mainnet, to \`dev@pay.mostro.foundation\` (0.19.2)

**Fixes**
- LNURL fetches ignore system proxies

**StartOS**
- Image pin \`mostrop2p/mostro:v0.19.3\` (amd64 + arm64)
- Package license matches upstream GPL-3.0
- \`[payer_history]\` and \`[reputation_import]\` are filled on upgrade; reputation import stays pinned off
- Cashu escrow is not packaged; this service still requires LND

Full notes: https://github.com/MostroP2P/mostro/releases/tag/v0.19.3`,
    es_ES: `Mostro actualizado a 0.19.3 (incluye 0.19.2).

**Novedades**
- **Configurar historial de pagador** — historial opcional de cuentas de pago y exigencia de declare-payer (apagado por defecto)
- Los ajustes de importación de reputación están modelados y se mantienen desactivados (vista previa de upstream; no activar hasta una versión posterior)
- Mint Cashu elegida por el maker y publicación de info en modo Cashu en upstream — el escrow Cashu sigue sin empaquetarse aquí
- user-info responde con la reputación propia del nodo
- Las comisiones de desarrollo solo en LND mainnet, a \`dev@pay.mostro.foundation\` (0.19.2)

**Correcciones**
- Las consultas LNURL ignoran los proxies del sistema

**StartOS**
- Imagen \`mostrop2p/mostro:v0.19.3\` (amd64 + arm64)
- La licencia del paquete coincide con GPL-3.0 de upstream
- \`[payer_history]\` y \`[reputation_import]\` se rellenan al actualizar; la importación de reputación permanece fijada en off
- El escrow Cashu no está empaquetado; este servicio sigue requiriendo LND

Notas completas: https://github.com/MostroP2P/mostro/releases/tag/v0.19.3`,
    de_DE: `Mostro auf 0.19.3 aktualisiert (inkl. 0.19.2).

**Funktionen**
- **Zahlerhistorie konfigurieren** — optionale Zahlungskonto-Historie und declare-payer-Zwang (standardmäßig aus)
- Reputation-Import-Einstellungen sind modelliert und bleiben aus (Upstream-Vorschau; nicht aktivieren, bis eine spätere Version Import-Anfragen beantwortet)
- Maker-gewählte Cashu-Mint und Cashu-Info-Event upstream — Cashu-Escrow bleibt hier unpaketiert
- user-info antwortet mit der eigenen Reputation des Knotens
- Dev-Gebühren nur auf LND-Mainnet an \`dev@pay.mostro.foundation\` (0.19.2)

**Korrekturen**
- LNURL-Abrufe ignorieren System-Proxys

**StartOS**
- Image-Pin \`mostrop2p/mostro:v0.19.3\` (amd64 + arm64)
- Paketlizenz entspricht Upstream GPL-3.0
- \`[payer_history]\` und \`[reputation_import]\` werden beim Upgrade gesetzt; Reputation-Import bleibt aus
- Cashu-Escrow ist nicht paketiert; dieser Dienst benötigt weiterhin LND

Vollständige Hinweise: https://github.com/MostroP2P/mostro/releases/tag/v0.19.3`,
    pl_PL: `Zaktualizowano Mostro do 0.19.3 (zawiera 0.19.2).

**Funkcje**
- **Konfiguruj historię płatnika** — opcjonalna historia kont płatności i wymóg declare-payer (domyślnie wyłączone)
- Ustawienia importu reputacji są modelowane i pozostają wyłączone (podgląd upstream; nie włączać, dopóki późniejsza wersja nie obsłuży żądań importu)
- Mint Cashu wybierany przez makera i publikacja info w trybie Cashu w upstream — escrow Cashu nadal nie jest tu pakowany
- user-info odpowiada własną reputacją węzła
- Opłaty deweloperskie tylko na LND mainnet, na \`dev@pay.mostro.foundation\` (0.19.2)

**Poprawki**
- Pobieranie LNURL ignoruje systemowe proxy

**StartOS**
- Pin obrazu \`mostrop2p/mostro:v0.19.3\` (amd64 + arm64)
- Licencja pakietu zgodna z GPL-3.0 upstream
- \`[payer_history]\` i \`[reputation_import]\` uzupełniane przy upgrade; import reputacji pozostaje wyłączony
- Escrow Cashu nie jest spakowany; ta usługa nadal wymaga LND

Pełne uwagi: https://github.com/MostroP2P/mostro/releases/tag/v0.19.3`,
    fr_FR: `Mostro mis à jour vers 0.19.3 (inclut 0.19.2).

**Fonctionnalités**
- **Configurer l’historique du payeur** — historique optionnel des comptes de paiement et exigence declare-payer (désactivé par défaut)
- Les réglages d’import de réputation sont modélisés et restent désactivés (aperçu upstream ; ne pas activer avant une version ultérieure)
- Mint Cashu choisi par le maker et publication d’info en mode Cashu en amont — l’escrow Cashu n’est toujours pas empaqueté ici
- user-info répond avec la réputation propre du nœud
- Frais de développement uniquement sur LND mainnet, vers \`dev@pay.mostro.foundation\` (0.19.2)

**Corrections**
- Les requêtes LNURL ignorent les proxies système

**StartOS**
- Image \`mostrop2p/mostro:v0.19.3\` (amd64 + arm64)
- La licence du paquet suit le GPL-3.0 amont
- \`[payer_history]\` et \`[reputation_import]\` sont renseignés à la mise à jour ; l’import de réputation reste figé désactivé
- L’escrow Cashu n’est pas empaqueté ; ce service exige toujours LND

Notes complètes : https://github.com/MostroP2P/mostro/releases/tag/v0.19.3`,
  },
  migrations: {
    up: async ({ effects }) => {
      // Fill new 0.19.3 keys (payer_history, reputation_import) from .catch()
      // defaults. Existing values stay; reputation_import.enabled is repaired
      // to false if somehow set.
      await daemon_settings.merge(effects, {})
    },
    down: IMPOSSIBLE,
  },
})
