import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { daemon_settings } from '../fileModels/settings'

export const current = VersionInfo.of({
  version: '0.20.1:0',
  releaseNotes: {
    en_US: `Updated Mostro to 0.20.1 (includes 0.20.0).

**Features**
- Publishes a signed health event (kind 38389) every 60 seconds reporting whether LND is synced, buyers are being paid, relays and the database are working
- Enters maintenance mode (no new orders or takes; open trades can finish) when LND stays unsynced for 10 minutes, and leaves it once LND has been synced for 5 minutes
- Reputation import and export are handled upstream — both stay off in this package

**Fixes**
- One bad invoice or a stale order no longer holds up other payouts; failed dev-fee payments back off per order
- Fewer false warnings for a briefly missing relay, a slow payout, or LND between blocks

**StartOS**
- **Escrow Deadline Margin** must be at least 18 blocks and below **Hold Invoice CLTV Delta**; a saved margin under 18 is reset to 24 on upgrade
- Cashu escrow is not packaged; this service still requires LND

Full notes: https://github.com/MostroP2P/mostro/releases/tag/v0.20.1`,
    es_ES: `Mostro actualizado a 0.20.1 (incluye 0.20.0).

**Novedades**
- Publica cada 60 segundos un evento de salud firmado (kind 38389) que indica si LND está sincronizado, si se paga a los compradores y si los relays y la base de datos funcionan
- Entra en modo mantenimiento (sin nuevas órdenes ni tomas; los trades abiertos pueden terminar) cuando LND sigue sin sincronizar durante 10 minutos, y sale cuando LND lleva 5 minutos sincronizado
- La importación y exportación de reputación se gestionan en upstream; ambas siguen desactivadas en este paquete

**Correcciones**
- Una factura defectuosa o una orden caducada ya no retrasan otros pagos; los pagos fallidos de comisiones de desarrollo esperan por orden antes de reintentar
- Menos avisos falsos por un relay ausente un momento, un pago lento o LND entre bloques

**StartOS**
- **Margen de plazo del escrow** debe ser de al menos 18 bloques y menor que **Delta CLTV de la hold-invoice**; un margen guardado por debajo de 18 se restablece a 24 al actualizar
- El escrow Cashu no está empaquetado; este servicio sigue requiriendo LND

Notas completas: https://github.com/MostroP2P/mostro/releases/tag/v0.20.1`,
    de_DE: `Mostro auf 0.20.1 aktualisiert (inkl. 0.20.0).

**Funktionen**
- Veröffentlicht alle 60 Sekunden ein signiertes Health-Event (kind 38389), das meldet, ob LND synchronisiert ist, Käufer bezahlt werden und Relays sowie Datenbank funktionieren
- Wechselt in den Wartungsmodus (keine neuen Orders oder Takes; offene Trades können abschließen), wenn LND 10 Minuten lang nicht synchronisiert ist, und verlässt ihn, sobald LND 5 Minuten synchronisiert ist
- Reputation-Import und -Export werden upstream verarbeitet — beide bleiben in diesem Paket aus

**Korrekturen**
- Eine fehlerhafte Rechnung oder eine veraltete Order hält andere Auszahlungen nicht mehr auf; fehlgeschlagene Dev-Gebühren-Zahlungen warten pro Order vor einem neuen Versuch
- Weniger Fehlwarnungen bei einem kurz fehlenden Relay, einer langsamen Auszahlung oder LND zwischen Blöcken

**StartOS**
- **Escrow-Fristmarge** muss mindestens 18 Blöcke betragen und unter **Hold-Invoice-CLTV-Delta** liegen; eine gespeicherte Marge unter 18 wird beim Upgrade auf 24 zurückgesetzt
- Cashu-Escrow ist nicht paketiert; dieser Dienst benötigt weiterhin LND

Vollständige Hinweise: https://github.com/MostroP2P/mostro/releases/tag/v0.20.1`,
    pl_PL: `Zaktualizowano Mostro do 0.20.1 (zawiera 0.20.0).

**Funkcje**
- Co 60 sekund publikuje podpisane zdarzenie zdrowia (kind 38389), informujące, czy LND jest zsynchronizowany, czy kupujący otrzymują wypłaty oraz czy działają przekaźniki i baza danych
- Przechodzi w tryb konserwacji (bez nowych zleceń i przyjęć; otwarte transakcje mogą się zakończyć), gdy LND pozostaje niezsynchronizowany przez 10 minut, i wychodzi z niego, gdy LND jest zsynchronizowany od 5 minut
- Import i eksport reputacji są obsługiwane w upstream — w tym pakiecie oba pozostają wyłączone

**Poprawki**
- Jedna błędna faktura lub przeterminowane zlecenie nie wstrzymują już innych wypłat; nieudane płatności opłat deweloperskich czekają per zlecenie przed ponowieniem
- Mniej fałszywych ostrzeżeń przy chwilowo brakującym przekaźniku, wolnej wypłacie lub LND między blokami

**StartOS**
- **Margines terminu escrow** musi wynosić co najmniej 18 bloków i być mniejszy niż **Delta CLTV hold-invoice**; zapisany margines poniżej 18 jest przy aktualizacji ustawiany na 24
- Escrow Cashu nie jest spakowany; ta usługa nadal wymaga LND

Pełne uwagi: https://github.com/MostroP2P/mostro/releases/tag/v0.20.1`,
    fr_FR: `Mostro mis à jour vers 0.20.1 (inclut 0.20.0).

**Fonctionnalités**
- Publie toutes les 60 secondes un événement de santé signé (kind 38389) indiquant si LND est synchronisé, si les acheteurs sont payés et si les relais et la base de données fonctionnent
- Passe en mode maintenance (pas de nouveaux ordres ni de prises ; les échanges ouverts peuvent se terminer) quand LND reste non synchronisé pendant 10 minutes, et en sort une fois LND synchronisé depuis 5 minutes
- L’import et l’export de réputation sont gérés en amont — les deux restent désactivés dans ce paquet

**Corrections**
- Une facture invalide ou un ordre périmé ne bloque plus les autres paiements ; les paiements de frais de développement échoués attendent par ordre avant de réessayer
- Moins de fausses alertes pour un relais brièvement absent, un paiement lent ou LND entre deux blocs

**StartOS**
- **Marge de délai d’escrow** doit être d’au moins 18 blocs et inférieure à **Delta CLTV de la hold-invoice** ; une marge enregistrée sous 18 est remise à 24 lors de la mise à jour
- L’escrow Cashu n’est pas empaqueté ; ce service exige toujours LND

Notes complètes : https://github.com/MostroP2P/mostro/releases/tag/v0.20.1`,
  },
  migrations: {
    up: async ({ effects }) => {
      await daemon_settings.merge(effects, {})
    },
    down: IMPOSSIBLE,
  },
})
