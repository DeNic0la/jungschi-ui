import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipantHealthDetailsComponent } from './participant-health-details.component';
import { TeamService } from '../../shared/services/team.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideTranslateTesting } from '../../shared/testing/translate-testing';

describe('ParticipantHealthDetailsComponent', () => {
  let component: ParticipantHealthDetailsComponent;
  let fixture: ComponentFixture<ParticipantHealthDetailsComponent>;
  let teamServiceMock: any;

  beforeEach(async () => {
    // Mock ResizeObserver for PrimeNG Tabs
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );

    teamServiceMock = {
      getParticipant: vi.fn().mockReturnValue(
        of({
          firstname: 'Test',
          lastname: 'User',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          lastUpdatedAt: '2021-01-01T12:00:00',
          user: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            phoneNumber: '079 123 45 67',
            address: 'Teststrasse 1',
          },
          healthStats: { isHealthy: true, healthyReason: null, excludedActivities: null },
          campStats: {
            isTickVaccinated: true,
            drugConsent: true,
            ahv: '123',
            krankenkasse: 'AOK',
            krankenkassenNr: 'KK123',
            medication: 'None',
            familyDoctor: null,
            nationality: null,
            nativeLanguage: null,
            foodPreferences: null,
            notes: null,
          },
          intoleranceSelections: [],
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ParticipantHealthDetailsComponent],
      providers: [
        { provide: TeamService, useValue: teamServiceMock },
        provideRouter([]),
        provideTranslateTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantHealthDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load and display participant details', async () => {
    const mockParticipant = {
      id: 123,
      firstname: 'John',
      lastname: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      lastUpdatedAt: '2021-01-01T12:00:00',
      user: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        phoneNumber: '079 111 22 33',
        address: 'Some Address',
      },
      healthStats: { isHealthy: true, healthyReason: null, excludedActivities: null },
      campStats: {
        isTickVaccinated: true,
        drugConsent: true,
        ahv: '123',
        krankenkasse: 'AOK',
        krankenkassenNr: 'KK123',
        medication: 'None',
        familyDoctor: null,
        nationality: null,
        nativeLanguage: null,
        foodPreferences: null,
        notes: null,
      },
      intoleranceSelections: [],
    };
    teamServiceMock.getParticipant.mockReturnValue(of(mockParticipant));

    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.textContent).toContain('John Doe');
    expect(element.textContent).toContain('079 111 22 33');
    expect(teamServiceMock.getParticipant).toHaveBeenCalledWith('123');

    // Verify JSON view also exists
    const pre = fixture.nativeElement.querySelector('pre');
    expect(pre.textContent).toContain('John');
  });

  it('should display intolerances with correct severity', async () => {
    const mockParticipant = {
      id: 123,
      firstname: 'John',
      lastname: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      lastUpdatedAt: '2021-01-01T12:00:00',
      user: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        phoneNumber: '079 123 45 67',
        address: 'Teststrasse 1',
      },
      healthStats: { isHealthy: true, healthyReason: null, excludedActivities: null },
      campStats: {
        isTickVaccinated: true,
        drugConsent: true,
        ahv: '123',
        krankenkasse: 'AOK',
        krankenkassenNr: 'KK123',
        medication: 'None',
        familyDoctor: null,
        nationality: null,
        nativeLanguage: null,
        foodPreferences: null,
        notes: null,
      },
      intoleranceSelections: [
        {
          id: 1,
          intolerance: {
            id: 1,
            label: 'test',
            definitionValue: 'Erdnussallergie',
            category: 'FoodIntolerance',
          },
          customText: 'Very dangerous',
          severity: 'LIFE_THREATENING',
        },
      ],
    };
    teamServiceMock.getParticipant.mockReturnValue(of(mockParticipant));

    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.textContent).toContain('Erdnussallergie');
    expect(element.textContent).toContain('Very dangerous');
  });

  it('should display error message on failure', async () => {
    teamServiceMock.getParticipant.mockReturnValue(throwError(() => new Error('API Error')));

    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.textContent;
    expect(errorMessage).toContain('Fehler beim Laden');
  });

  it('should handle null healthStats and campStats gracefully', async () => {
    const mockParticipant = {
      id: 1,
      firstname: 'Nicola Maria',
      lastname: 'Fioretti',
      dateOfBirth: '2026-03-11',
      gender: 'male',
      lastUpdatedAt: '2026-03-19T12:27:48.618243',
      user: {
        firstName: 'Nicola',
        lastName: 'Fioretti',
        email: 'alocinfioretti@gmail.com',
      },
      healthStats: null,
      campStats: null,
      intoleranceSelections: [],
    };
    teamServiceMock.getParticipant.mockReturnValue(of(mockParticipant));

    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const noDataElements = Array.from(
      fixture.nativeElement.querySelectorAll('p.italic.text-surface-500'),
    ) as HTMLElement[];
    expect(noDataElements.some((el) => el.textContent?.includes('Keine Daten vorhanden'))).toBe(
      true,
    );

    expect(fixture.nativeElement.textContent).toContain('Keine Einträge vorhanden');
  });
});
