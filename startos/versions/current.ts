import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { daemon_settings } from '../fileModels/settings'

export const current = VersionInfo.of({
  version: '0.19.1:0',
  releaseNotes: {
    en_US: `Updated Mostro to 0.19.1 (includes 0.19.0).

**Features**
- Optional **Serbero** dispute assistant: set its pubkey under **Configure Mostro Settings**; Mostro registers it as a read-only solver and announces it in the info event
- Protocol v1 (gift-wrap) is removed; the daemon speaks nip44 only. A leftover \`transport = "gift-wrap"\` refuses to start — this package keeps pinning nip44
- Makers can cancel before paying the bond; **Configure Anti-Abuse Bond** includes the maker-bond payment timeout (default 900s)
- Disputes close as cooperatively-canceled on a cooperative cancel, and as released when the seller releases

**Fixes**
- Hold invoices the seller just paid are never canceled; bond winners can claim shares below the minimum; bond CancelLightning lookups work; dispute writes are atomic
- Trade-key, taker-bond expiry, maker-bond deadline, amt/fa tag, price-staleness, and publish/solver notification fixes from 0.19.0

**StartOS**
- Image pin \`mostrop2p/mostro:v0.19.1\` (amd64 + arm64)
- \`serbero_pubkey\` and \`maker_bond_payment_timeout_seconds\` are filled on upgrade and exposed in Trading actions
- Cashu escrow is not packaged; this service still requires LND

Full notes: https://github.com/MostroP2P/mostro/releases/tag/v0.19.1`,
    es_ES: `Mostro actualizado a 0.19.1 (incluye 0.19.0).

**Novedades**
- Asistente de disputas **Serbero** opcional: configura su clave en **Configurar ajustes de Mostro**; Mostro lo registra como solver de solo lectura y lo anuncia en el evento de información
- El protocolo v1 (gift-wrap) se elimina; el daemon solo habla nip44. Un \`transport = "gift-wrap"\` residual impide el arranque — este paquete sigue fijando nip44
- Los makers pueden cancelar antes de pagar la fianza; **Configurar fianza antiabuso** incluye el tiempo de pago de la fianza del maker (900s por defecto)
- Las disputas se cierran como cancelación cooperativa en una cancelación cooperativa, y como liberadas cuando el vendedor libera

**Correcciones**
- No se cancelan hold-invoices que el vendedor acaba de pagar; los ganadores de fianza pueden reclamar cuotas por debajo del mínimo; lookups CancelLightning de fianza; escrituras de disputa atómicas
- Correcciones de 0.19.0 sobre claves de trade, expiración de fianza del taker, plazo del maker, etiquetas amt/fa, caducidad de precios y notificaciones

**StartOS**
- Imagen \`mostrop2p/mostro:v0.19.1\` (amd64 + arm64)
- \`serbero_pubkey\` y \`maker_bond_payment_timeout_seconds\` se rellenan al actualizar y están en las acciones de Trading
- El escrow Cashu no está empaquetado; este servicio sigue requiriendo LND

Notas completas: https://github.com/MostroP2P/mostro/releases/tag/v0.19.1`,
    de_DE: `Mostro auf 0.19.1 aktualisiert (inkl. 0.19.0).

**Funktionen**
- Optionaler **Serbero**-Streitassistent: Pubkey unter **Mostro-Einstellungen konfigurieren**; Mostro registriert ihn als schreibgeschützten Solver und kündigt ihn im Info-Event an
- Protokoll v1 (gift-wrap) ist entfernt; der Daemon spricht nur nip44. Ein übrig gebliebenes \`transport = "gift-wrap"\` verhindert den Start — dieses Paket pinnt weiterhin nip44
- Maker können vor der Bond-Zahlung stornieren; **Anti-Abuse-Bond konfigurieren** enthält das Maker-Bond-Zahlungs-Timeout (Standard 900s)
- Disputes schließen als kooperativ storniert bei kooperativer Stornierung und als freigegeben, wenn der Verkäufer freigibt

**Korrekturen**
- Hold-Invoices, die der Verkäufer gerade bezahlt hat, werden nicht storniert; Bond-Gewinner können Anteile unter dem Minimum beanspruchen; Bond-CancelLightning-Lookups; atomare Dispute-Schreibvorgänge
- Trade-Key-, Taker-Bond-, Maker-Frist-, amt/fa-, Preis-Staleness- und Publish/Solver-Korrekturen aus 0.19.0

**StartOS**
- Image-Pin \`mostrop2p/mostro:v0.19.1\` (amd64 + arm64)
- \`serbero_pubkey\` und \`maker_bond_payment_timeout_seconds\` werden beim Upgrade gesetzt und in Trading-Aktionen angeboten
- Cashu-Escrow ist nicht paketiert; dieser Dienst benötigt weiterhin LND

Vollständige Hinweise: https://github.com/MostroP2P/mostro/releases/tag/v0.19.1`,
    pl_PL: `Zaktualizowano Mostro do 0.19.1 (zawiera 0.19.0).

**Funkcje**
- Opcjonalny asystent sporów **Serbero**: ustaw klucz w **Konfiguruj ustawienia Mostro**; Mostro rejestruje go jako solver tylko do odczytu i ogłasza w zdarzeniu info
- Protokół v1 (gift-wrap) został usunięty; demon mówi tylko nip44. Pozostałe \`transport = "gift-wrap"\` blokuje start — ten pakiet nadal pinuje nip44
- Makerzy mogą anulować przed opłaceniem kaucji; **Konfiguruj kaucję antynadużyciową** zawiera timeout płatności kaucji maker (domyślnie 900s)
- Spory zamykane są jako kooperacyjnie anulowane przy kooperacyjnym anulowaniu oraz jako released, gdy sprzedawca zwalnia

**Poprawki**
- Hold-invoice właśnie opłacone przez sprzedawcę nie są anulowane; zwycięzcy kaucji mogą wypłacać udziały poniżej minimum; lookupi CancelLightning kaucji; atomowe zapisy sporów
- Poprawki 0.19.0: klucze trade, wygaśnięcie kaucji takera, termin makera, tagi amt/fa, staleness cen, publish/solver

**StartOS**
- Pin obrazu \`mostrop2p/mostro:v0.19.1\` (amd64 + arm64)
- \`serbero_pubkey\` i \`maker_bond_payment_timeout_seconds\` uzupełniane przy upgrade i dostępne w akcjach Trading
- Escrow Cashu nie jest spakowany; ta usługa nadal wymaga LND

Pełne uwagi: https://github.com/MostroP2P/mostro/releases/tag/v0.19.1`,
    fr_FR: `Mostro mis à jour vers 0.19.1 (inclut 0.19.0).

**Fonctionnalités**
- Assistant de litiges **Serbero** optionnel : définissez sa clé dans **Configurer les paramètres Mostro** ; Mostro l’enregistre comme solver en lecture seule et l’annonce dans l’événement d’info
- Le protocole v1 (gift-wrap) est retiré ; le démon ne parle que nip44. Un \`transport = "gift-wrap"\` résiduel refuse de démarrer — ce paquet continue de figer nip44
- Les makers peuvent annuler avant de payer la caution ; **Configurer la caution anti-abus** inclut le délai de paiement de la caution maker (900s par défaut)
- Les litiges se ferment en annulation coopérative lors d’une annulation coopérative, et en released lorsque le vendeur libère

**Corrections**
- Les hold-invoices que le vendeur vient de payer ne sont jamais annulées ; les gagnants de caution peuvent réclamer des parts sous le minimum ; lookups CancelLightning des cautions ; écritures de litige atomiques
- Correctifs 0.19.0 : clés de trade, expiration caution taker, délai maker, tags amt/fa, fraîcheur des prix, publish/solver

**StartOS**
- Image \`mostrop2p/mostro:v0.19.1\` (amd64 + arm64)
- \`serbero_pubkey\` et \`maker_bond_payment_timeout_seconds\` sont renseignés à la mise à jour et exposés dans les actions Trading
- L’escrow Cashu n’est pas empaqueté ; ce service exige toujours LND

Notes complètes : https://github.com/MostroP2P/mostro/releases/tag/v0.19.1`,
  },
  migrations: {
    up: async ({ effects }) => {
      // Fill new 0.19.x keys (maker_bond_payment_timeout_seconds,
      // serbero_pubkey) from .catch() defaults. Invalid leftover
      // transport = gift-wrap is repaired to nip44 so mostrod can start.
      await daemon_settings.merge(effects, {})
    },
    down: IMPOSSIBLE,
  },
})
