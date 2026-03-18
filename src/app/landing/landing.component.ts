import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  imports: [],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Willkommen bei Jungschi</h1>
        <p>Die ultimative Plattform für moderne Web-Erlebnisse. Gebaut mit Angular, Signals und Barrierefreiheit im Blick.</p>
        <div class="hero-actions">
          <button class="btn btn-primary lg">Jetzt loslegen</button>
          <button class="btn btn-secondary lg">Mehr erfahren</button>
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <h2>Funktionen</h2>
      <div class="features-grid">
        @for (feature of features(); track feature.title) {
          <div class="feature-card">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        }
      </div>
    </section>

    <section id="about" class="about">
      <h2>Über uns</h2>
      <p>Wir widmen uns der Bereitstellung der besten Werkzeuge für Entwickler und Benutzer gleichermaßen. Unser Fokus liegt auf Leistung, Sicherheit und einer außergewöhnlichen Benutzererfahrung.</p>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .hero {
      padding: 5rem 2rem;
      background: linear-gradient(to bottom right, #eff6ff, #ffffff);
      text-align: center;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .hero h1 {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
    }

    .hero p {
      font-size: 1.25rem;
      color: #4b5563;
      margin-bottom: 2.5rem;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .features {
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .features h2 {
      font-size: 2.25rem;
      text-align: center;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      padding: 2rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      transition: box-shadow 0.2s;
    }

    .feature-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #111827;
    }

    .about {
      padding: 4rem 2rem;
      background: #f9fafb;
      text-align: center;
    }

    .about p {
      max-width: 600px;
      margin: 0 auto;
      font-size: 1.125rem;
      color: #4b5563;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .btn.lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
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
  protected readonly features = signal([
    {
      title: 'Hohe Performance',
      description: 'Entwickelt mit Angular Signals für blitzschnelle Reaktivität und optimale Leistung.',
    },
    {
      title: 'Barrierefrei durch Design',
      description: 'Befolgt die WCAG AA Richtlinien, um sicherzustellen, dass jeder Ihre Anwendung nutzen kann.',
    },
    {
      title: 'Moderner Stack',
      description: 'Verwendet die neuesten Angular-Features wie Standalone-Komponenten und Control Flow.',
    },
  ]);

  protected readonly currentYear = new Date().getFullYear();
}
