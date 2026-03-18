import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { signal } from '@angular/core';
import { App } from './app';

describe('App', () => {
  let keycloakMock: any;
  let keycloakSignal: any;

  beforeEach(async () => {
    keycloakMock = {
      authenticated: false,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
    };
    keycloakSignal = signal({ type: KeycloakEventType.Ready });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: Keycloak, useValue: keycloakMock },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakSignal },
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
