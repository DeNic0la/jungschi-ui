import { describe, expect, it, vi, beforeAll } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { of } from 'rxjs';
import { CampSignupsComponent } from './camp-signups.component';
import { CampService } from '../../shared/services/camp.service';
import { RoomService } from '../../shared/services/room.service';
import { SignupService } from '../../shared/services/signup.service';
import { provideTranslateTesting } from '../../shared/testing/translate-testing';
import { TeamSignupDto } from '../../shared/models/signup.model';

const camp = {
  id: 'summer-2027',
  title: 'Sommerlager 2027',
  description: null,
  startDate: '2027-07-12',
  endDate: '2027-07-19',
  signupEndDate: '2027-06-01',
  isJugendUndSport: true,
  priceFirst: 120,
  priceSecond: 100,
  priceThird: 80,
};

function signup(id: number, state: TeamSignupDto['state']): TeamSignupDto {
  return {
    id,
    campId: camp.id,
    householdId: id,
    state,
    feedback: null,
    photoConsent: true,
    infoEmail: true,
    additionalContactOptionsDuringCamp: 'Telefon nach 20:00',
    campParticipants: [
      {
        id: id * 10,
        participantId: id,
        firstname: 'Anna',
        lastname: `Muster ${id}`,
        gender: 'female',
        schoolClass: '5',
        infosZimmerleitung: null,
        bemerkungen: null,
        drugConsent: null,
        medications: [],
        roomId: null,
        roomName: null,
        fullAccess: false,
        roomLeaderInfoVisible: false,
      },
    ],
  };
}

describe('CampSignupsComponent', () => {
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

  it('sorts signups needing review before in-progress and approved signups', async () => {
    await TestBed.configureTestingModule({
      imports: [CampSignupsComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura } }),
        provideTranslateTesting(),
        { provide: CampService, useValue: { getAll: vi.fn().mockReturnValue(of([camp])) } },
        {
          provide: RoomService,
          useValue: {
            getAvailableForCampParticipant: vi.fn().mockReturnValue(of([])),
          },
        },
        {
          provide: SignupService,
          useValue: {
            getForCampReview: vi
              .fn()
              .mockReturnValue(
                of([signup(3, 'APPROVED'), signup(2, 'IN_PROGRESS'), signup(1, 'COMPLETED')]),
              ),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CampSignupsComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance['signups']().map((item) => item.state)).toEqual([
      'COMPLETED',
      'IN_PROGRESS',
      'APPROVED',
    ]);
  });
});
