import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-landing-page',
  imports: [Button, Card],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Willkommen bei Jungschi</h1>
        <p>
          Die ultimative Plattform für moderne Web-Erlebnisse. Gebaut mit Angular, Signals und
          Barrierefreiheit im Blick.
        </p>
        <div class="hero-actions">
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

    <section id="features" class="features">
      <h2>Funktionen</h2>
      <div class="features-grid">
        @for (feature of features(); track feature.title) {
          <p-card [header]="feature.title" class="feature-card">
            <p class="m-0">{{ feature.description }}</p>
          </p-card>
        }
      </div>
    </section>

    <section id="about" class="about">
      <h2>Über uns</h2>
      <p>
        Wir widmen uns der Bereitstellung der besten Werkzeuge für Entwickler und Benutzer
        gleichermaßen. Unser Fokus liegt auf Leistung, Sicherheit und einer außergewöhnlichen
        Benutzererfahrung.
      </p>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .hero {
      padding: 5rem 2rem;
      background: linear-gradient(to bottom right, var(--p-primary-900), var(--p-surface-900));
      text-align: center;
      color: var(--p-text-color);
    }

    .hero-content {
      max-width: 1000px;
      margin: 0 auto;
    }

    .hero h1 {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: inherit;
    }

    .hero p {
      font-size: 1.25rem;
      color: inherit;
      opacity: 0.9;
      margin-bottom: 2.5rem;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .features {
      padding: 4rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .features h2 {
      font-size: 2.25rem;
      text-align: center;
      margin-bottom: 3rem;
      color: var(--p-text-color);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      height: 100%;
    }

    .about {
      padding: 4rem 2rem;
      background: var(--p-surface-800);
      color: var(--p-surface-0);
      text-align: center;
    }

    .about h2 {
      color: inherit;
      margin-bottom: 2rem;
      font-size: 2.25rem;
    }

    .about p {
      max-width: 800px;
      margin: 0 auto;
      font-size: 1.125rem;
      color: inherit;
      opacity: 0.9;
    }

    @media (max-width: 640px) {
      .hero h1 {
        font-size: 2.5rem;
      }
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
