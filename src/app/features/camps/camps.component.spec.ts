import { describe, it, expect, vi, beforeAll } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { CampsComponent } from './camps.component';
import { SignupComponent } from './signup.component';
import { CampService } from '../../shared/services/camp.service';
import { ParticipantService } from '../../shared/services/participant.service';
import { SignupService } from '../../shared/services/signup.service';
import { provideTranslateTesting } from '../../shared/testing/translate-testing';

const futureCamp = {
  id: 'summer-2027',
  title: 'Sommerlager 2027',
  description: 'Eine Woche Lager',
  startDate: '2027-07-12',
  endDate: '2027-07-19',
  signupEndDate: '2027-06-01',
  isJugendUndSport: true,
  priceFirst: 120,
  priceSecond: 100,
  priceThird: 80,
};

describe('CampsComponent', () => {
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

  it('should render available camps', async () => {
    await TestBed.configureTestingModule({
      imports: [CampsComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura } }),
        provideTranslateTesting(),
        { provide: CampService, useValue: { getAll: vi.fn().mockReturnValue(of([futureCamp])) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CampsComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Sommerlager 2027');
    expect(fixture.nativeElement.textContent).toContain('Anmeldung offen');
  });
});

describe('SignupComponent', () => {
  it('should create and complete a signup payload', async () => {
    const signupServiceMock = {
      create: vi.fn().mockReturnValue(of({ id: 5, state: 'IN_PROGRESS' })),
      complete: vi.fn().mockReturnValue(of({ id: 5, state: 'COMPLETED' })),
    };

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura } }),
        provideTranslateTesting(),
        { provide: CampService, useValue: { getById: vi.fn().mockReturnValue(of(futureCamp)) } },
        {
          provide: ParticipantService,
          useValue: {
            getAll: vi.fn().mockReturnValue(
              of([
                {
                  id: 7,
                  firstname: 'Anna',
                  lastname: 'Muster',
                  dateOfBirth: '2015-01-01',
                  gender: 'female',
                  lastUpdatedAt: '2026-05-17T00:00:00',
                },
              ]),
            ),
          },
        },
        {
          provide: SignupService,
          useValue: {
            ...signupServiceMock,
            getForCamp: vi.fn().mockReturnValue(of(null)),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignupComponent);
    fixture.componentRef.setInput('campId', futureCamp.id);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component['setParticipantSelected'](
      {
        id: 7,
        firstname: 'Anna',
        lastname: 'Muster',
        dateOfBirth: '2015-01-01',
        gender: 'female',
        lastUpdatedAt: '2026-05-17T00:00:00',
      },
      true,
    );
    component['updateParticipantDraft'](7, {
      schoolClass: '5a',
      drugConsent: true,
    });

    component['save'](true);

    expect(signupServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        campId: 'summer-2027',
        infoEmail: true,
        campParticipants: [
          expect.objectContaining({
            participantId: 7,
            schoolClass: '5a',
            drugConsent: true,
          }),
        ],
      }),
    );
    expect(signupServiceMock.complete).toHaveBeenCalledWith(5);
  });
});
