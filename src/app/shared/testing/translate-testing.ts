import { Provider } from '@angular/core';
import { TranslateLoader, provideTranslateService, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

const TEST_TRANSLATIONS: TranslationObject = {
  app: {
    auth: {
      login: 'Anmelden',
      logout: 'Abmelden',
      myProfile: 'Mein Profil',
      profileFallback: 'Profil',
      userMenu: 'Benutzermenü',
    },
    footer: {
      impressum: 'Impressum',
      rights: '© {{year}} Jungschi. Alle Rechte vorbehalten.',
    },
    nav: {
      participants: 'Teilnehmer',
      team: 'Team',
    },
  },
  common: {
    actions: {
      back: 'Zurück',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      remove: 'Entfernen',
      save: 'Speichern',
      search: 'Suchen...',
      view: 'Anzeigen',
    },
    boolean: {
      no: 'Nein',
      yes: 'Ja',
    },
    empty: {
      noData: 'Keine Daten vorhanden.',
      noEntries: 'Keine Einträge vorhanden.',
      none: 'Keine',
    },
    fields: {
      dateOfBirth: 'Geburtsdatum',
      firstName: 'Vorname',
      lastName: 'Nachname',
      lastUpdatedAt: 'Zuletzt aktualisiert',
    },
    status: {
      error: 'Fehler',
      loading: 'Laden...',
      loadingData: 'Lade Daten...',
      saved: 'Gespeichert!',
      savedSuccessfully: 'Erfolgreich gespeichert!',
      success: 'Erfolg',
    },
    table: {
      actions: 'Aktionen',
    },
  },
  features: {
    participantDetail: {
      actions: {
        backToList: 'Zurück zur Liste',
      },
      allergy: {
        title: 'Allergien & Lebensmittel-Unverträglichkeiten',
      },
      campStats: {
        title: 'Lager Daten',
      },
      healthStats: {
        title: 'Gesundheitsinfo',
      },
      notFound: 'Teilnehmer mit der ID {{id}} konnte nicht gefunden werden.',
      tabs: {
        allergy: 'Allergien & Essen',
        campStats: 'Lager Daten',
        healthStats: 'Gesundheitsinfo',
        overview: 'Übersicht',
      },
      title: 'Teilnehmer-Details',
    },
    participants: {
      empty: 'Keine Teilnehmer gefunden.',
      messages: {
        phoneMissingSummary: 'Telefonnummer fehlt',
      },
      title: 'Teilnehmer',
    },
    profile: {
      title: 'Profil',
    },
    team: {
      healthData: {
        title: 'Gesundheitsdaten',
      },
      healthDetails: {
        messages: {
          loadError: 'Fehler beim Laden der Teilnehmerdaten.',
        },
        title: 'Gesundheitsdetails',
      },
      title: 'Jungschiteam',
      welcome: 'Willkommen auf der Team-Seite!',
    },
  },
  legal: {
    impressum: {
      title: 'Impressum',
    },
  },
};

class TestTranslateLoader extends TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of(TEST_TRANSLATIONS);
  }
}

export function provideTranslateTesting(): Provider[] {
  return provideTranslateService({
    fallbackLang: 'de',
    lang: 'de',
    loader: {
      provide: TranslateLoader,
      useClass: TestTranslateLoader,
    },
  });
}
