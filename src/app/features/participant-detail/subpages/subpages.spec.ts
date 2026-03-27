import { describe, it, expect, vi } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { HealthStatsComponent } from './health-stats.component';
import { CampStatsComponent } from './camp-stats.component';
import { AllergyComponent } from './allergy.component';
import { By } from '@angular/platform-browser';
import { GlobalDefinitionsService } from '../../../shared/services/global-definitions.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { ParticipantService } from '../../../shared/services/participant.service';
import { ConfirmationService } from 'primeng/api';

describe('Participant Subpages', () => {
  describe('HealthStatsComponent', () => {
    it('should show title', () => {
      TestBed.configureTestingModule({
        imports: [HealthStatsComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideAnimationsAsync(),
          provideRouter([]),
          ConfirmationService,
        ],
      });
      const fixture = TestBed.createComponent(HealthStatsComponent);
      fixture.componentRef.setInput('id', '1');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent).toBe(
        'Gesundheitsinfo',
      );
    });

    it('should load data and patch form', async () => {
      const mockStats = {
        isHealthy: false,
        healthyReason: 'Some reason',
        excludedActivities: 'Some activities',
      };
      const participantServiceMock = {
        getHealthStats: vi.fn().mockReturnValue(of(mockStats)),
        updateHealthStats: vi.fn(),
      };

      TestBed.configureTestingModule({
        imports: [HealthStatsComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideAnimationsAsync(),
          provideRouter([]),
          { provide: ParticipantService, useValue: participantServiceMock },
          ConfirmationService,
        ],
      });

      const fixture = TestBed.createComponent(HealthStatsComponent);
      fixture.componentRef.setInput('id', '1');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const component = fixture.componentInstance;
      expect(component['form'].value.isHealthy).toBe(false);
      expect(component['form'].value.healthyReason).toBe('Some reason');
      expect(component['form'].value.excludedActivities).toBe('Some activities');
    });

    it('should save data successfully', async () => {
      const participantServiceMock = {
        getHealthStats: vi.fn().mockReturnValue(of(null)),
        updateHealthStats: vi.fn().mockReturnValue(of({})),
      };

      TestBed.configureTestingModule({
        imports: [HealthStatsComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideAnimationsAsync(),
          provideRouter([]),
          { provide: ParticipantService, useValue: participantServiceMock },
          ConfirmationService,
        ],
      });

      const fixture = TestBed.createComponent(HealthStatsComponent);
      fixture.componentRef.setInput('id', '1');
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.componentInstance['form'].patchValue({ isHealthy: true });
      fixture.componentInstance['form'].markAsDirty();
      fixture.detectChanges();

      const saveBtn = fixture.debugElement.query(By.css('button[type="submit"]'));
      saveBtn.nativeElement.click();

      expect(participantServiceMock.updateHealthStats).toHaveBeenCalled();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('p-message[severity="success"]'))).toBeTruthy();
    });

    it('should reset to healthy on delete', async () => {
      const participantServiceMock = {
        getHealthStats: vi.fn().mockReturnValue(of({ isHealthy: false, healthyReason: 'ill' })),
        updateHealthStats: vi.fn().mockReturnValue(of({})),
      };
      const confirmationServiceMock = {
        confirm: vi.fn().mockImplementation((config) => config.accept?.()),
        requireConfirmation$: of(),
      };

      TestBed.configureTestingModule({
        imports: [HealthStatsComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideAnimationsAsync(),
          provideRouter([]),
          { provide: ParticipantService, useValue: participantServiceMock },
          { provide: ConfirmationService, useValue: confirmationServiceMock },
        ],
      });

      const fixture = TestBed.createComponent(HealthStatsComponent);
      fixture.componentRef.setInput('id', '1');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const deleteBtn = fixture.debugElement.query(By.css('#delete-btn button'));
      deleteBtn.nativeElement.click();

      expect(participantServiceMock.updateHealthStats).toHaveBeenCalledWith(1, {
        isHealthy: true,
        healthyReason: null,
        excludedActivities: null,
      });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture.componentInstance['form'].value.isHealthy).toBe(true);
    });
  });

  it('CampStatsComponent should show title', () => {
    TestBed.configureTestingModule({
      imports: [CampStatsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        provideRouter([]),
      ],
    });
    const fixture = TestBed.createComponent(CampStatsComponent);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent).toBe('Lager Daten');
  });

  it('AllergyComponent should show title', () => {
    TestBed.configureTestingModule({
      imports: [AllergyComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        provideRouter([]),
        {
          provide: GlobalDefinitionsService,
          useValue: {
            getAllergies: () => of([]),
            getFoodIntolerances: () => of([]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AllergyComponent);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent).toBe(
      'Allergien & Lebensmittel-Unverträglichkeiten',
    );
  });
});
