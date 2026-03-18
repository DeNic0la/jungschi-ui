import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <header class="header">
      <nav class="nav" aria-label="Main Navigation">
        <span class="logo">Jungschi</span>
        <div class="nav-links">
          <a href="#features">Funktionen</a>
          <a href="#about">Über uns</a>
          @if (isLoggedIn()) {
            <button class="btn btn-secondary" (click)="logout()" aria-label="Abmelden">
              Abmelden
            </button>
          } @else {
            <button class="btn btn-primary" (click)="login()" aria-label="Anmelden">Anmelden</button>
          }
        </div>
      </nav>
    </header>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <p>&copy; {{ currentYear }} Jungschi. Alle Rechte vorbehalten.</p>
    </footer>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
    }

    .header {
      padding: 1rem 2rem;
      background: #fff;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .nav {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3b82f6;
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .nav-links a {
      text-decoration: none;
      color: #4b5563;
      font-weight: 500;
    }

    .nav-links a:hover {
      color: #1d4ed8;
    }

    .main-content {
      flex: 1;
    }

    .footer {
      padding: 2rem;
      text-align: center;
      border-top: 1px solid #eee;
      color: #6b7280;
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

    @media (max-width: 640px) {
      .nav-links a {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly keycloak = inject(KeycloakService);

  protected readonly isLoggedIn = signal(false);
  protected readonly currentYear = new Date().getFullYear();

  constructor() {
    this.isLoggedIn.set(this.keycloak.isLoggedIn());
  }

  protected login(): void {
    this.keycloak.login();
  }

  protected logout(): void {
    this.keycloak.logout(window.location.origin);
  }
}
