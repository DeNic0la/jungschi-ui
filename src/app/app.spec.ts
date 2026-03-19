import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { App } from './app';
import { UserService } from './services/user.service';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('App', () => {
  let keycloakMock: any;
  let keycloakSignal: any;
  let userServiceMock: any;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(async () => {
    keycloakMock = {
      authenticated: false,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      hasRealmRole: vi.fn().mockReturnValue(false),
    };
    keycloakSignal = signal({ type: KeycloakEventType.Ready });
    userServiceMock = {
      getUserProfile: vi.fn().mockReturnValue(of({ username: 'testuser' })),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        providePrimeNG({
          theme: {
            preset: Aura,
            options: {
              darkModeSelector: 'system',
            },
          },
        }),
        { provide: Keycloak, useValue: keycloakMock },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakSignal },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();
  });

  it('should call keycloak.login when login is clicked', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const loginSpy = vi.spyOn(keycloakMock, 'login');

    app['login']();

    expect(loginSpy).toHaveBeenCalled();
  });

  it('should update isLoggedIn when keycloak events fire', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app['isLoggedIn']()).toBe(false);

    keycloakSignal.set({ type: KeycloakEventType.AuthSuccess });
    fixture.detectChanges();

    expect(app['isLoggedIn']()).toBe(true);

    keycloakSignal.set({ type: KeycloakEventType.AuthLogout });
    fixture.detectChanges();

    expect(app['isLoggedIn']()).toBe(false);
  });

  it('should show Team menu item only if user has Jungschiteam role', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // Not logged in
    expect(app['menuItems']().some((i) => i.label === 'Team')).toBe(false);

    // Logged in, no role
    keycloakSignal.set({ type: KeycloakEventType.AuthSuccess });
    fixture.detectChanges();
    expect(app['menuItems']().some((i) => i.label === 'Team')).toBe(false);

    // Logged in, with role
    keycloakMock.hasRealmRole.mockReturnValue(true);
    // Trigger signal update if necessary (menuItems is computed, depends on isLoggedIn)
    // Actually it doesn't depend on a signal that changes when roles are checked if we don't use a signal for roles.
    // However, isLoggedIn changing will trigger it.
    // Let's re-trigger AuthSuccess or just set isLoggedIn again.
    app['isLoggedIn'].set(false);
    app['isLoggedIn'].set(true);
    fixture.detectChanges();

    expect(app['menuItems']().some((i) => i.label === 'Team')).toBe(true);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
