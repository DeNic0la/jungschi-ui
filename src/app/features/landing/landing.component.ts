import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-landing-page',
  imports: [Button, Card],
  template: `
    <section class="py-20 px-8 text-center bg-primary-50 dark:bg-surface-950 transition-colors">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight text-surface-900 dark:text-surface-0">
          Willkommen bei Jungschi
        </h1>
        <p class="text-lg sm:text-xl text-surface-600 dark:text-surface-400 mb-10 max-w-2xl mx-auto">
          Die ultimative Plattform für moderne Web-Erlebnisse. Gebaut mit Angular, Signals und
          Barrierefreiheit im Blick.
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <p-button label="Jetzt loslegen" size="large" (click)="login()" />
          <p-button
            label="Mehr erfahren"
            size="large"
            severity="secondary"
            (click)="scrollToFeatures()"
          />
        </div>
      </div>
    </section>

    <section id="features" class="py-16 px-8 max-w-7xl mx-auto">
      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-12 text-surface-900 dark:text-surface-0">
        Funktionen
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
  private readonly keycloak = inject(Keycloak);

  protected readonly features = signal([
    {
      title: 'Hohe Performance',
      description:
        'Entwickelt mit Angular Signals für blitzschnelle Reaktivität und optimale Leistung.',
    },
    {
      title: 'Barrierefrei durch Design',
      description:
        'Befolgt die WCAG AA Richtlinien, um sicherzustellen, dass jeder Ihre Anwendung nutzen kann.',
    },
    {
      title: 'Moderner Stack',
      description:
        'Verwendet die neuesten Angular-Features wie Standalone-Komponenten und Control Flow.',
    },
  ]);

  protected readonly currentYear = new Date().getFullYear();

  protected login(): void {
    this.keycloak.login({
      redirectUri: window.location.origin,

    });
  }

  protected scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
