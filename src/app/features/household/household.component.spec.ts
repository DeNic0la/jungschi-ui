import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { HouseholdComponent } from './household.component';
import { HouseholdService } from '../../shared/services/household.service';
import { provideTranslateTesting } from '../../shared/testing/translate-testing';

describe('HouseholdComponent', () => {
  let householdServiceMock: any;

  const household = {
    id: 1,
    streetAndNumber: 'Main 1',
    plz: '6000',
    place: 'Luzern',
    guardians: [
      {
        email: 'current@example.com',
        username: 'current',
        firstName: 'Current',
        lastName: 'Guardian',
        pictureUrl: null,
        contactType: 'PRIMARY',
        pending: false,
        currentUser: true,
      },
    ],
  };

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
    householdServiceMock = {
      get: vi.fn().mockReturnValue(of(household)),
      update: vi.fn().mockReturnValue(of({ ...household, place: 'Kriens' })),
      addGuardian: vi.fn().mockReturnValue(
        of({
          ...household,
          guardians: [
            ...household.guardians,
            {
              email: 'pending@example.com',
              username: null,
              firstName: null,
              lastName: null,
              pictureUrl: null,
              contactType: 'PENDING',
              pending: true,
              currentUser: false,
            },
          ],
        }),
      ),
      removeGuardian: vi.fn().mockReturnValue(of(household)),
      updateGuardianContactType: vi.fn().mockReturnValue(
        of({
          ...household,
          guardians: [
            { ...household.guardians[0], contactType: 'ADDITIONAL' },
            {
              email: 'secondary@example.com',
              username: 'secondary',
              firstName: 'Secondary',
              lastName: 'Guardian',
              pictureUrl: null,
              contactType: 'SECONDARY',
              pending: false,
              currentUser: false,
            },
          ],
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [HouseholdComponent, ReactiveFormsModule],
      providers: [
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura } }),
        provideTranslateTesting(),
        { provide: HouseholdService, useValue: householdServiceMock },
      ],
    }).compileComponents();
  });

  it('should load household data', async () => {
    const fixture = TestBed.createComponent(HouseholdComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(householdServiceMock.get).toHaveBeenCalled();
    expect(component['householdForm'].get('streetAndNumber')?.value).toBe('Main 1');
    expect(fixture.nativeElement.textContent).toContain('current@example.com');
  });

  it('should save household address', async () => {
    const fixture = TestBed.createComponent(HouseholdComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component['householdForm'].patchValue({ place: 'Kriens' });
    await component['saveHousehold']();

    expect(householdServiceMock.update).toHaveBeenCalledWith({
      streetAndNumber: 'Main 1',
      plz: '6000',
      place: 'Kriens',
    });
  });

  it('should add a pending guardian by email', async () => {
    const fixture = TestBed.createComponent(HouseholdComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component['guardianForm'].patchValue({ email: 'pending@example.com' });
    await component['addGuardian']();

    expect(householdServiceMock.addGuardian).toHaveBeenCalledWith({
      email: 'pending@example.com',
    });
    expect(component['household']()?.guardians.map((guardian) => guardian.email)).toContain(
      'pending@example.com',
    );
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect((text.match(/Ausstehend/g) ?? []).length).toBe(1);
    expect(text).not.toContain('pending Ausstehend');
  });

  it('should set guardian contact type', async () => {
    const fixture = TestBed.createComponent(HouseholdComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    await component['setContactType']('secondary@example.com', 'SECONDARY');

    expect(householdServiceMock.updateGuardianContactType).toHaveBeenCalledWith(
      'secondary@example.com',
      { contactType: 'SECONDARY' },
    );
    expect(
      component['household']()?.guardians.find(
        (guardian) => guardian.email === 'secondary@example.com',
      )?.contactType,
    ).toBe('SECONDARY');
  });
});
