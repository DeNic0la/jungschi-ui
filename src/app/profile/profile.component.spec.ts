import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import Keycloak from 'keycloak-js';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { UserService } from '../services/user.service';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('ProfileComponent', () => {
  let keycloakMock: any;
  let userServiceMock: any;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(async () => {
    keycloakMock = {
      accountManagement: vi.fn().mockResolvedValue(undefined),
      login: vi.fn().mockResolvedValue(undefined),
    };

    userServiceMock = {
      getUserProfile: vi.fn().mockReturnValue(
        of({
          id: 1,
          oidcSubject: 'test-subject',
          username: 'testuser',
          email: 'test@example.com',
          phoneNumber: '123456789',
          firstName: 'Test',
          lastName: 'User',
        }),
      ),
      updateUserProfile: vi.fn().mockReturnValue(
        of({
          id: 1,
          oidcSubject: 'test-subject',
          username: 'testuser',
          email: 'test@example.com',
          phoneNumber: '987654321',
          firstName: 'Updated',
          lastName: 'User',
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
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
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the profile component', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;

    // Wait for ngOnInit async operations
    await fixture.whenStable();
    fixture.detectChanges();

    expect(userServiceMock.getUserProfile).toHaveBeenCalled();
    expect(component['profileForm'].get('username')?.value).toBe('testuser');
    expect(component['profileForm'].get('email')?.value).toBe('test@example.com');
  });

  it('should call updateUserProfile when saveProfile is called', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component['profileForm'].patchValue({
      email: 'updated@example.com',
      firstName: 'Updated',
      lastName: 'User',
      phoneNumber: '987654321',
    });

    await component['saveProfile']();

    expect(userServiceMock.updateUserProfile).toHaveBeenCalledWith({
      email: 'updated@example.com',
      firstName: 'Updated',
      lastName: 'User',
      phoneNumber: '987654321',
    });
  });

  it('should call login with update password action', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    await component['changePassword']();

    expect(keycloakMock.login).toHaveBeenCalledWith({ action: 'UPDATE_PASSWORD' });
  });

  it('should call accountManagement when manageAccount is called', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    await component['manageAccount']();

    expect(keycloakMock.accountManagement).toHaveBeenCalled();
  });
});
