import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { App } from './app';

describe('App', () => {
  let keycloakServiceMock: any;

  beforeEach(async () => {
    keycloakServiceMock = {
      isLoggedIn: () => false,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: KeycloakService, useValue: keycloakServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
