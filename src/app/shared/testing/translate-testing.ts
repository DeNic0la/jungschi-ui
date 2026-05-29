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
      camps: 'Lager',
      household: 'Haushalt',
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
      refresh: 'Aktualisieren',
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
        title: 'Allgemeine Angaben',
      },
      healthStats: {
        title: 'Gesundheitsinfo',
      },
      notFound: 'Teilnehmer mit der ID {{id}} konnte nicht gefunden werden.',
      tabs: {
        allergy: 'Allergien & Essen',
        campStats: 'Allgemeine Angaben',
        healthStats: 'Gesundheitsinfo',
        overview: 'Übersicht',
      },
      title: 'Teilnehmer-Details',
    },
    camps: {
      actions: {
        signup: 'Anmelden',
      },
      empty: 'Keine Lager vorhanden.',
      fields: {
        priceFirst: 'Preis erstes Kind',
        signupEndDate: 'Anmeldeschluss',
      },
      messages: {
        loadError: 'Lager konnten nicht geladen werden.',
      },
      status: {
        open: 'Anmeldung offen',
        started: 'Gestartet',
      },
      title: 'Lager',
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
    household: {
      actions: {
        addGuardian: 'Hinzufügen',
        setPrimary: 'Als Hauptkontakt festlegen',
        setSecondary: 'Als Zweitkontakt festlegen',
      },
      contactTypes: {
        additional: 'Zusätzlich',
        pending: 'Ausstehend',
        primary: 'Hauptkontakt',
        secondary: 'Zweitkontakt',
      },
      empty: {
        guardians: 'Keine Erziehungsberechtigten im Haushalt vorhanden.',
      },
      form: {
        guardianEmail: {
          label: 'Erziehungsberechtigte per E-Mail hinzufügen',
        },
        place: {
          label: 'Ort',
        },
        plz: {
          label: 'PLZ',
        },
        streetAndNumber: {
          label: 'Strasse und Nummer',
        },
      },
      messages: {
        addGuardianError: 'Erziehungsberechtigte Person konnte nicht hinzugefügt werden.',
        contactTypeError: 'Kontaktrolle konnte nicht aktualisiert werden.',
        loadError: 'Haushalt konnte nicht geladen werden.',
        removeGuardianError: 'Erziehungsberechtigte Person konnte nicht entfernt werden.',
        saveError: 'Haushalt konnte nicht gespeichert werden.',
      },
      sections: {
        address: 'Adresse',
        guardians: 'Erziehungsberechtigte',
      },
      title: 'Haushalt',
    },
    signup: {
      actions: {
        addMedication: 'Medikament hinzufügen',
        complete: 'Anmeldung abschliessen',
        reopen: 'Anmeldung bearbeiten',
        saveProgress: 'Zwischenstand speichern',
      },
      confirmReopenApproved:
        'Diese Anmeldung wurde bereits bestätigt. Wenn Sie sie wieder bearbeiten, wird die Anmeldung zurückgezogen und muss den Anmeldeprozess erneut durchlaufen.',
      form: {
        additionalContactOptionsDuringCamp: {
          label: 'Zusätzliche Kontaktmöglichkeiten während dem Lager',
        },
        bemerkungen: {
          label: 'Zusätzliche Notizen',
        },
        dose: {
          label: 'Dosierung',
        },
        drugConsent: {
          label: 'Einverständnis zur Medikamentenabgabe',
        },
        frequency: {
          label: 'Häufigkeit',
        },
        infoEmail: {
          label: 'Informationen per E-Mail erhalten',
        },
        infosZimmerleitung: {
          label: 'Informationen für die Zimmerleitung',
        },
        medicationName: {
          label: 'Medikament',
        },
        needsHelp: {
          label: 'Braucht Hilfe',
        },
        photoConsent: {
          label: 'Fotoeinverständnis',
        },
        purpose: {
          label: 'Zweck',
        },
        schoolClass: {
          label: 'Schulklasse während dem Lager',
        },
      },
      messages: {
        campStarted: 'Dieses Lager hat bereits begonnen. Eine Anmeldung ist nicht mehr möglich.',
        drugConsentRequired:
          'Bitte für alle ausgewählten Teilnehmer die Medikamentenabgabe auswählen.',
        loadError: 'Anmeldedaten konnten nicht geladen werden.',
        noParticipants: 'Keine Teilnehmer im Haushalt vorhanden.',
        reopenError: 'Anmeldung konnte nicht zur Bearbeitung geöffnet werden.',
        saveError:
          'Anmeldung konnte nicht gespeichert werden. Die benötigte Backend-API ist noch nicht verfügbar.',
        saved: 'Anmeldung gespeichert.',
        selectParticipant: 'Bitte mindestens einen Teilnehmer auswählen.',
      },
      sections: {
        medication: 'Medikamente im Lager',
        participants: 'Teilnehmer auswählen',
        signupData: 'Anmeldedaten',
        summary: 'Zusammenfassung',
      },
      summary: {
        selectedParticipants: 'Ausgewählte Teilnehmer',
      },
      states: {
        APPROVED: 'Bestätigt',
        COMPLETED: 'Eingereicht',
        IN_PROGRESS: 'In Bearbeitung',
      },
      title: 'Lageranmeldung',
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
      roomManagement: {
        emptyLeaders: 'Keine Teammitglieder verfügbar.',
        empty: 'Keine Zimmer für dieses Lager vorhanden.',
        fields: {
          assignedCount: 'Belegung',
          camp: 'Lager',
          gender: 'Geschlecht',
          leaders: 'Zimmerleitung',
          maxCapacity: 'Maximale Belegung',
          name: 'Zimmername',
        },
        form: {
          create: 'Zimmer erstellen',
          edit: 'Zimmer bearbeiten',
        },
        messages: {
          loadError: 'Zimmer konnten nicht geladen oder gespeichert werden.',
        },
        title: 'Zimmer verwalten',
      },
      campManagement: {
        actions: {
          deleteEndedCamp: 'Beendetes Lager löschen',
        },
        delete: {
          confirm:
            'Dieses Lager wird gelöscht. Zimmer, Zimmerleitungen, Lagerteilnehmer und Medikamentendaten zu diesem Lager werden entfernt. Teilnehmer und Anmeldungen bleiben erhalten.',
          description:
            'Optional können Rückmeldungen für alle Anmeldungen im Lager "{{title}}" nach Status gesetzt werden, bevor das Lager gelöscht wird.',
          title: 'Lager löschen',
        },
        empty: 'Keine Lager vorhanden.',
        fields: {
          description: 'Beschreibung',
          endDate: 'Enddatum',
          id: 'Lager-ID',
          isJugendUndSport: 'Jugend+Sport Lager',
          priceFirst: 'Preis erstes Kind',
          priceSecond: 'Preis zweites Kind',
          priceThird: 'Preis ab drittem Kind',
          signupEndDate: 'Anmeldeschluss',
          startDate: 'Startdatum',
          title: 'Titel',
        },
        form: {
          create: 'Lager erstellen',
          edit: 'Lager bearbeiten',
        },
        messages: {
          loadError: 'Lager konnten nicht geladen, gespeichert oder gelöscht werden.',
        },
        title: 'Lager verwalten',
      },
      signups: {
        actions: {
          approve: 'Bestätigen',
          reject: 'Zur Korrektur zurückgeben',
          saveFeedback: 'Rückmeldung speichern',
          showParticipantDetails: 'Details anzeigen',
        },
        detail: {
          title: 'Lagerteilnehmer-Details',
        },
        empty: 'Keine Anmeldungen für dieses Lager vorhanden.',
        fields: {
          camp: 'Lager',
          currentRoom: 'Aktuelles Zimmer',
          feedback: 'Rückmeldung',
          household: 'Haushalt',
          room: 'Zimmer',
        },
        messages: {
          loadError: 'Anmeldungen konnten nicht geladen oder aktualisiert werden.',
        },
        privacy: {
          modalFiltered:
            'Einige Details sind ausgeblendet, weil sie nur für Erziehungsberechtigte, Admins, Sanität oder die zuständige Zimmerleitung sichtbar sind.',
          roomLeaderInfoHidden:
            'Informationen für die Zimmerleitung sind für diese Rolle ausgeblendet.',
          sensitiveDataHidden: 'Weitere Lagerteilnehmerdaten sind für diese Rolle ausgeblendet.',
        },
        signupTitle: 'Anmeldung #{{id}}',
        title: 'Lageranmeldungen',
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
