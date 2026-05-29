import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  computed,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { Menubar } from 'primeng/menubar';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { UserService } from './shared/services/user.service';
import { firstValueFrom, Observable } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar, Button, Menu, RouterLink, TranslatePipe],
  template: `
    <header class="sticky top-0 z-50 shadow-sm">
      <p-menubar [model]="menuItems()" styleClass="border-0 rounded-none px-4 sm:px-8 py-3">
        <ng-template #start>
          <span
            [routerLink]="['/']"
            class="text-2xl font-black mr-6 text-primary cursor-pointer tracking-tighter"
          >
            Jungschi
          </span>
        </ng-template>
        <ng-template #end>
          <div class="flex items-center gap-4">
            @if (isLoggedIn()) {
              <p-button
                severity="secondary"
                (click)="userMenu.toggle($event)"
                [attr.aria-label]="'app.auth.userMenu' | translate"
              >
                <div class="flex items-center gap-2">
                  <i class="pi pi-user"></i>
                  <span class="max-w-[150px] truncate hidden sm:inline">
                    {{ userProfile()?.username ?? ('app.auth.profileFallback' | translate) }}
                  </span>
                </div>
              </p-button>
              <p-menu #userMenu [model]="userMenuItems()" [popup]="true" appendTo="body" />
            } @else {
              <p-button
                [label]="'app.auth.login' | translate"
                icon="pi pi-sign-in"
                (click)="login()"
                [attr.aria-label]="'app.auth.login' | translate"
              />
            }
          </div>
        </ng-template>
      </p-menubar>
    </header>

    <main class="flex-1">
      <router-outlet></router-outlet>
    </main>

    <footer
      class="p-8 text-center border-t border-surface-200 dark:border-surface-700 text-surface-500 text-sm"
    >
      <p>{{ 'app.footer.rights' | translate: { year: currentYear } }}</p>
      <nav class="mt-4">
        <a
          [routerLink]="['/impressum']"
          class="hover:text-primary transition-colors cursor-pointer"
        >
          {{ 'app.footer.impressum' | translate }}
        </a>
      </nav>
    </footer>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  private readonly userService = inject(UserService);
  private readonly translate = inject(TranslateService);
  private readonly translations = toSignal(
    this.translate.stream([
      'app.nav.participants',
      'app.nav.household',
      'app.nav.camps',
      'app.nav.team',
      'app.auth.myProfile',
      'app.auth.logout',
    ]) as Observable<Record<string, string>>,
    { initialValue: {} as Record<string, string> },
  );

  protected readonly isLoggedIn = signal(false);
  protected readonly userProfile = this.userService.userProfile;
  protected readonly currentYear = new Date().getFullYear();

  protected readonly menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [];

    if (this.isLoggedIn()) {
      items.push({
        label: this.t('app.nav.participants'),
        icon: 'pi pi-users',
        routerLink: '/participants',
      });
      if (this.keycloak.hasRealmRole('guardian')) {
        items.push({
          label: this.t('app.nav.household'),
          icon: 'pi pi-home',
          routerLink: '/household',
        });
      }
      items.push({
        label: this.t('app.nav.camps'),
        icon: 'pi pi-calendar',
        routerLink: '/camps',
      });

      if (
        this.keycloak.hasRealmRole('Jungschiteam') ||
        this.keycloak.hasRealmRole('ADMIN') ||
        this.keycloak.hasRealmRole('Sanitaet')
      ) {
        items.push({
          label: this.t('app.nav.team'),
          icon: 'pi pi-id-card',
          routerLink: '/team',
        });
      }
    }

    return items;
  });

  protected readonly userMenuItems = computed<MenuItem[]>(() => [
    {
      label: this.t('app.auth.myProfile'),
      icon: 'pi pi-user',
      routerLink: '/profile',
    },
    {
      label: this.t('app.auth.logout'),
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ]);

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
        this.userService.clearProfile();
      }
    });

    effect(() => {
      if (this.isLoggedIn()) {
        firstValueFrom(this.userService.getUserProfile()).catch((err) =>
          console.error('Failed to load user profile in app', err),
        );
      }
    });
  }

  protected login(): void {
    this.keycloak
      .login({
        prompt: 'login',
        action: 'login',
        redirectUri: window.location.origin + '/profile'
      })
      .catch((err) => console.error('Login error:', err));
  }

  protected logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  private t(key: string): string {
    return this.translations()[key] ?? this.translate.instant(key);
  }
}
