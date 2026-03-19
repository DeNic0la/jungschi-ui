import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipantHealthDetailsComponent } from './participant-health-details.component';
import { TeamService } from '../services/team.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
          lastUpdatedAt: '2021-01-01T12:00:00',
          user: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com' },
          healthStats: { isHealthy: true, healthyReason: null, excludedActivities: null },
          campStats: {
            isTickVaccinated: true,
            drugConsent: true,
            ahv: '123',
            krankenkasse: 'AOK',
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
      lastUpdatedAt: '2021-01-01T12:00:00',
      user: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com' },
      healthStats: { isHealthy: true, healthyReason: null, excludedActivities: null },
      campStats: {
        isTickVaccinated: true,
        drugConsent: true,
        ahv: '123',
        krankenkasse: 'AOK',
        notes: null,
      },
      intoleranceSelections: [],
    };
    teamServiceMock.getParticipant.mockReturnValue(of(mockParticipant));

    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const valueElements = fixture.nativeElement.querySelectorAll('.value');
    expect(valueElements[0].textContent).toContain('John Doe');
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
      lastUpdatedAt: '2021-01-01T12:00:00',
      user: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com' },
      healthStats: { isHealthy: true, healthyReason: null, excludedActivities: null },
      campStats: {
        isTickVaccinated: true,
        drugConsent: true,
        ahv: '123',
        krankenkasse: 'AOK',
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

    const label = fixture.nativeElement.querySelector('.item-label');
    expect(label.textContent).toContain('Erdnussallergie');

    const text = fixture.nativeElement.querySelector('.item-text');
    expect(text.textContent).toContain('Very dangerous');
  });

  it('should display error message on failure', async () => {
    teamServiceMock.getParticipant.mockReturnValue(throwError(() => new Error('API Error')));

    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Fehler beim Laden');
  });

  it('should handle null healthStats and campStats gracefully', async () => {
    const mockParticipant = {
      id: 1,
      firstname: 'Nicola Maria',
      lastname: 'Fioretti',
      dateOfBirth: '2026-03-11',
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

    const noDataElements = fixture.nativeElement.querySelectorAll('.no-data');
    expect(noDataElements.length).toBe(2);
    expect(noDataElements[0].textContent).toContain('Keine Daten vorhanden');
    expect(noDataElements[1].textContent).toContain('Keine Daten vorhanden');

    const emptyIntoleranceMessage = fixture.nativeElement.querySelector(
      '.full-width p:not(.no-data)',
    );
    expect(emptyIntoleranceMessage.textContent).toContain('Keine Einträge vorhanden');
  });
});
