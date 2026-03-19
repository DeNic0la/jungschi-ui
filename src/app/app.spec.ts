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

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
