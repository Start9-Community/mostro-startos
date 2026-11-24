import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import {
  daemon_settings,
  DEFAULT_CURRENCY_API_EXCEPT,
  isBondCltvValid,
  LEGACY_CURRENCY_API_EXCEPT,
} from '../fileModels/settings'

const sameCodes = (a: string[], b: string[]) =>
  a.length === b.length && a.every((code) => b.includes(code))

export const current = VersionInfo.of({
  version: '0.20.3:0',
  releaseNotes: {
    en_US: `Updated Mostro to 0.20.3 (includes 0.20.2).

**Features**
- Pegged currencies: orders in stablecoins (USDT, USDC, DOC, priced from the USD rate) and bitcoin on other networks (BTC on-chain, LBTC, RBTC, amounts in sats). Off by default; turn on in **Configure Price Providers**
- Admins can look up an order with the admin-order-info action

**Fixes**
- Bond hold invoices get their own CLTV (**Bond CLTV Delta**), by default Hold Invoice CLTV Delta + 288, capped at 864 blocks
- A currency with exactly two price sources that disagree is refused instead of priced from a bad rate
- The taker bond is released when the escrow deadline cancels a trade
- LNURL fetches require https (http only for .onion); outbound DM payloads are no longer logged

**StartOS**
- Yadio and currency-api now skip the codes upstream measured as misquoted, so minor fiats keep a price; a currency-api exclusion list left at the old default is updated
- With bonds on, a Hold Invoice CLTV Delta of 720 or more leaves no valid bond CLTV: bonds are turned off on upgrade in that case
- With maker bonds, orders resting in the book leave it on the first start; their bonds are released and makers must publish again

Full notes: https://github.com/MostroP2P/mostro/releases/tag/v0.20.3`,
    es_ES: `Mostro actualizado a 0.20.3 (incluye 0.20.2).

**Novedades**
- Monedas ancladas: órdenes en stablecoins (USDT, USDC, DOC, con precio a partir de la tasa del USD) y bitcoin en otras redes (BTC on-chain, LBTC, RBTC, importes en sats). Desactivadas por defecto; actívalas en **Configurar proveedores de precio**
- Los administradores pueden consultar una orden con la acción admin-order-info

**Correcciones**
- Las hold-invoices de las fianzas tienen su propio CLTV (**Delta CLTV de la fianza**); por defecto, Delta CLTV de la hold-invoice + 288, con un máximo de 864 bloques
- Una moneda con exactamente dos fuentes de precio que no coinciden se rechaza en lugar de cotizarse con una tasa errónea
- La fianza del tomador se libera cuando el plazo del escrow cancela un trade
- Las consultas LNURL exigen https (http solo para .onion); ya no se registran los mensajes directos salientes

**StartOS**
- Yadio y currency-api omiten ahora los códigos que upstream midió como mal cotizados, para que las monedas menores sigan teniendo precio; una lista de exclusión de currency-api que seguía en el valor por defecto antiguo se actualiza
- Con fianzas activadas, un Delta CLTV de la hold-invoice de 720 o más no deja ningún CLTV de fianza válido: en ese caso las fianzas se desactivan al actualizar
- Con fianzas de creador, las órdenes publicadas en el libro salen de él en el primer arranque; sus fianzas se liberan y los creadores deben volver a publicar

Notas completas: https://github.com/MostroP2P/mostro/releases/tag/v0.20.3`,
    de_DE: `Mostro auf 0.20.3 aktualisiert (inkl. 0.20.2).

**Funktionen**
- Gekoppelte Währungen: Orders in Stablecoins (USDT, USDC, DOC, bepreist über den USD-Kurs) und Bitcoin in anderen Netzwerken (BTC on-chain, LBTC, RBTC, Beträge in Sats). Standardmäßig aus; einschalten unter **Preisanbieter konfigurieren**
- Admins können eine Order mit der Aktion admin-order-info abfragen

**Korrekturen**
- Bond-Hold-Invoices erhalten ein eigenes CLTV (**Bond-CLTV-Delta**), standardmäßig Hold-Invoice-CLTV-Delta + 288, höchstens 864 Blöcke
- Eine Währung mit genau zwei Preisquellen, die voneinander abweichen, wird abgelehnt statt mit einem falschen Kurs bepreist
- Der Taker-Bond wird freigegeben, wenn die Escrow-Frist einen Trade abbricht
- LNURL-Abrufe verlangen https (http nur für .onion); ausgehende DM-Inhalte werden nicht mehr protokolliert

**StartOS**
- Yadio und currency-api lassen jetzt die Codes aus, die upstream als falsch notiert gemessen hat, damit kleinere Fiat-Währungen einen Preis behalten; eine currency-api-Ausschlussliste auf dem alten Standard wird aktualisiert
- Mit aktivierten Bonds lässt ein Hold-Invoice-CLTV-Delta von 720 oder mehr kein gültiges Bond-CLTV zu: In diesem Fall werden Bonds beim Upgrade ausgeschaltet
- Mit Maker-Bonds verlassen Orders im Orderbuch es beim ersten Start; ihre Bonds werden freigegeben und Maker müssen neu veröffentlichen

Vollständige Hinweise: https://github.com/MostroP2P/mostro/releases/tag/v0.20.3`,
    pl_PL: `Zaktualizowano Mostro do 0.20.3 (zawiera 0.20.2).

**Funkcje**
- Waluty powiązane: zlecenia w stablecoinach (USDT, USDC, DOC, wyceniane według kursu USD) i bitcoinie w innych sieciach (BTC on-chain, LBTC, RBTC, kwoty w satach). Domyślnie wyłączone; włącz w **Konfiguruj dostawców cen**
- Administratorzy mogą sprawdzić zlecenie akcją admin-order-info

**Poprawki**
- Hold-invoice kaucji mają własny CLTV (**Delta CLTV kaucji**), domyślnie Delta CLTV hold-invoice + 288, maksymalnie 864 bloki
- Waluta z dokładnie dwoma źródłami cen, które się różnią, jest odrzucana zamiast wyceniana według błędnego kursu
- Kaucja przyjmującego jest zwalniana, gdy termin escrow anuluje transakcję
- Pobieranie LNURL wymaga https (http tylko dla .onion); treść wychodzących wiadomości DM nie jest już logowana

**StartOS**
- Yadio i currency-api pomijają teraz kody, które upstream zmierzył jako błędnie notowane, dzięki czemu mniejsze waluty fiat zachowują cenę; lista wykluczeń currency-api pozostawiona na starej wartości domyślnej zostaje zaktualizowana
- Przy włączonych kaucjach Delta CLTV hold-invoice wynosząca 720 lub więcej nie pozostawia poprawnego CLTV kaucji: w takim przypadku kaucje są wyłączane przy aktualizacji
- Przy kaucjach twórców zlecenia w księdze opuszczają ją przy pierwszym uruchomieniu; ich kaucje są zwalniane, a twórcy muszą opublikować je ponownie

Pełne uwagi: https://github.com/MostroP2P/mostro/releases/tag/v0.20.3`,
    fr_FR: `Mostro mis à jour vers 0.20.3 (inclut 0.20.2).

**Fonctionnalités**
- Devises indexées : ordres en stablecoins (USDT, USDC, DOC, valorisés au cours de l’USD) et en bitcoin sur d’autres réseaux (BTC on-chain, LBTC, RBTC, montants en sats). Désactivées par défaut ; à activer dans **Configurer les fournisseurs de prix**
- Les administrateurs peuvent consulter un ordre avec l’action admin-order-info

**Corrections**
- Les hold-invoices des cautions ont leur propre CLTV (**Delta CLTV de la caution**), par défaut Delta CLTV de la hold-invoice + 288, au plus 864 blocs
- Une devise avec exactement deux sources de prix en désaccord est refusée au lieu d’être valorisée à un mauvais cours
- La caution du preneur est libérée quand le délai d’escrow annule un échange
- Les requêtes LNURL exigent https (http seulement pour .onion) ; le contenu des messages directs sortants n’est plus journalisé

**StartOS**
- Yadio et currency-api ignorent désormais les codes qu’upstream a mesurés comme mal cotés, pour que les devises mineures gardent un prix ; une liste d’exclusion currency-api restée à l’ancienne valeur par défaut est mise à jour
- Avec les cautions activées, un Delta CLTV de la hold-invoice de 720 ou plus ne laisse aucun CLTV de caution valide : les cautions sont alors désactivées lors de la mise à jour
- Avec les cautions des créateurs, les ordres présents dans le carnet en sortent au premier démarrage ; leurs cautions sont libérées et les créateurs doivent republier

Notes complètes : https://github.com/MostroP2P/mostro/releases/tag/v0.20.3`,
  },
  migrations: {
    up: async ({ effects }) => {
      await daemon_settings.merge(effects, {})
      await daemon_settings.update(effects, (settings) => {
        if (settings === null) return null
        const currencyApi = settings.price.providers.currency_api
        const bond = settings.anti_abuse_bond
        return {
          ...settings,
          price: {
            ...settings.price,
            providers: {
              ...settings.price.providers,
              currency_api: {
                ...currencyApi,
                except: sameCodes(
                  currencyApi.except,
                  LEGACY_CURRENCY_API_EXCEPT,
                )
                  ? [...DEFAULT_CURRENCY_API_EXCEPT]
                  : currencyApi.except,
              },
            },
          },
          anti_abuse_bond: {
            ...bond,
            // Mostro 0.20.2+ refuses to start otherwise.
            enabled:
              bond.enabled &&
              isBondCltvValid(
                bond.bond_cltv_delta,
                settings.lightning.hold_invoice_cltv_delta,
              ),
          },
        }
      })
    },
    down: IMPOSSIBLE,
  },
})
