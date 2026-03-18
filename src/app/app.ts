import { ChangeDetectionStrategy, Component, effect, inject, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, typeEventArgs, ReadyArgs } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { Menubar } from 'primeng/menubar';
import { Button } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar, Button],
  template: `
    <header class="header">
      <p-menubar [model]="menuItems()">
        <ng-template #start>
          <span class="logo">Jungschi</span>
        </ng-template>
        <ng-template #end>
          <div class="nav-actions">
            @if (isLoggedIn()) {
              <p-button
                label="Abmelden"
                icon="pi pi-sign-out"
                severity="secondary"
                (click)="logout()"
                aria-label="Abmelden" />
            } @else {
              <p-button
                label="Anmelden"
                icon="pi pi-sign-in"
                (click)="login()"
                aria-label="Anmelden" />
            }
          </div>
        </ng-template>
      </p-menubar>
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
      font-family: var(--p-font-family);
      color: var(--p-text-color);
      line-height: 1.5;
    }

    .header {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--p-primary-color);
      margin-right: 2rem;
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .main-content {
      flex: 1;
    }

    .footer {
      padding: 2rem;
      text-align: center;
      border-top: 1px solid var(--p-content-border-color);
      color: var(--p-text-muted-color);
    }

    :host ::ng-deep .p-menubar {
      border-radius: 0;
      border-left: 0;
      border-right: 0;
      padding: 0.75rem 2rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  protected readonly isLoggedIn = signal(false);
  protected readonly currentYear = new Date().getFullYear();

  protected readonly menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      {
        label: 'Funktionen',
        icon: 'pi pi-list',
        command: () => this.scrollTo('#features'),
      },
      {
        label: 'Über uns',
        icon: 'pi pi-info-circle',
        command: () => this.scrollTo('#about'),
      },
    ];

    if (this.isLoggedIn()) {
      items.push({
        label: 'Profil',
        icon: 'pi pi-user',
        routerLink: '/profile',
      });
    }

    return items;
  });

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();

      if (event.type === KeycloakEventType.Ready) {
        this.isLoggedIn.set(typeEventArgs<ReadyArgs>(event.args));
      }

      if (event.type === KeycloakEventType.AuthSuccess) {
        this.isLoggedIn.set(true);
      }

      if (event.type === KeycloakEventType.AuthLogout) {
        this.isLoggedIn.set(false);
      }
    });
  }

  protected scrollTo(selector: string): void {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  }

  protected login(): void {
    this.keycloak.login().catch((err) => console.error('Login error:', err));
  }

  protected logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
