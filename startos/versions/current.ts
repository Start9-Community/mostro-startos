import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.19.1:1',
  releaseNotes: {
    en_US: `- **Configure Mostro Settings** keeps Development Fee Percentage between 0.10 and 1, the range Mostro starts with, and refuses a Serbero pubkey that is not an npub or 64-character hex key
- The descriptions in the Lightning, Trading and Price Provider settings explain what each option does
- **Configure Mostro Settings** no longer has a Bitcoin Price API URL field; price sources are set in **Configure Price Providers**
- Errors from the Nostr key and relay settings are shown in your language`,
    es_ES: `- **Configurar ajustes de Mostro** mantiene el porcentaje de comisión de desarrollo entre 0,10 y 1, el rango con el que Mostro arranca, y rechaza una clave pública de Serbero que no sea un npub o una clave hex de 64 caracteres
- Las descripciones de los ajustes de Lightning, Trading y proveedores de precio explican qué hace cada opción
- **Configurar ajustes de Mostro** ya no tiene el campo URL de la API de precio de Bitcoin; las fuentes de precio se configuran en **Configurar proveedores de precio**
- Los errores de los ajustes de clave y relays de Nostr se muestran en tu idioma`,
    de_DE: `- **Mostro-Einstellungen konfigurieren** hält die Entwicklungsgebühr zwischen 0,10 und 1, dem Bereich, mit dem Mostro startet, und lehnt einen Serbero-Pubkey ab, der kein npub und kein 64-stelliger Hex-Schlüssel ist
- Die Beschreibungen der Lightning-, Trading- und Preisanbieter-Einstellungen erklären, was jede Option bewirkt
- **Mostro-Einstellungen konfigurieren** hat kein Feld „Bitcoin-Preis-API-URL“ mehr; Preisquellen werden unter **Preisanbieter konfigurieren** festgelegt
- Fehler aus den Nostr-Schlüssel- und Relay-Einstellungen werden in deiner Sprache angezeigt`,
    pl_PL: `- **Konfiguruj ustawienia Mostro** utrzymuje procent opłaty rozwojowej między 0,10 a 1, czyli w zakresie, z którym Mostro się uruchamia, i odrzuca klucz publiczny Serbero, który nie jest npub ani 64-znakowym kluczem hex
- Opisy ustawień Lightning, Trading i dostawców cen wyjaśniają, co robi każda opcja
- **Konfiguruj ustawienia Mostro** nie ma już pola URL API ceny Bitcoina; źródła cen ustawia się w **Konfiguruj dostawców cen**
- Błędy z ustawień klucza i przekaźników Nostr są wyświetlane w Twoim języku`,
    fr_FR: `- **Configurer les paramètres Mostro** maintient le pourcentage des frais de développement entre 0,10 et 1, la plage avec laquelle Mostro démarre, et refuse une clé publique Serbero qui n’est ni un npub ni une clé hex de 64 caractères
- Les descriptions des réglages Lightning, Trading et des fournisseurs de prix expliquent ce que fait chaque option
- **Configurer les paramètres Mostro** n’a plus de champ URL de l’API de prix Bitcoin ; les sources de prix se règlent dans **Configurer les fournisseurs de prix**
- Les erreurs des réglages de clé et de relais Nostr s’affichent dans votre langue`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
