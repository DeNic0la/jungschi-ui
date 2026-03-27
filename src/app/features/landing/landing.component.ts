import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-landing-page',
  imports: [Button, Card],
  template: `
    <section class="py-20 px-8 text-center bg-primary-50 dark:bg-surface-950 transition-colors">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight text-surface-900 dark:text-surface-0">
          Willkommen bei der Jungschi Lager-Anmeldung
        </h1>
        <p class="text-lg sm:text-xl text-surface-600 dark:text-surface-400 mb-10 max-w-2xl mx-auto">
          Das neue Tool zur Übermittlung von Teilnehmerdaten für unsere Lager.
          Eltern können sich einmalig anmelden und die Daten für ihre Kinder bequem online erfassen.
          Bei Nutzung dieses Portals entfällt das Ausfüllen physischer Gesundheits- und Notfallblätter.
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <p-button
            label="Mehr erfahren"
            size="large"
            (click)="scrollToFeatures()"
          />
        </div>
      </div>
    </section>

    <section id="features" class="py-16 px-8 max-w-7xl mx-auto">
      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-12 text-surface-900 dark:text-surface-0">
        Ihre Vorteile
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (feature of features(); track feature.title) {
          <p-card [header]="feature.title" class="h-full">
            <p class="m-0 text-surface-600 dark:text-surface-400">{{ feature.description }}</p>
          </p-card>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  protected readonly features = signal([
    {
      title: 'Zentrale Verwaltung',
      description:
        'Einmal anmelden und alle Daten für Ihre Kinder bequem an einem Ort erfassen und verwalten.',
    },
    {
      title: 'Kein Papierkram',
      description:
        'Wenn Sie die Daten digital einreichen, müssen Sie kein physisches Gesundheits- oder Notfallblatt mehr ausfüllen.',
    },
    {
      title: 'Sicher & Aktuell',
      description:
        'Ihre Daten sind sicher gespeichert und können jederzeit für zukünftige Lager aktualisiert werden.',
    },
  ]);

  protected readonly currentYear = new Date().getFullYear();

  protected scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
