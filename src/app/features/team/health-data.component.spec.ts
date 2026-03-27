import { describe, it, expect, vi } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HealthDataComponent } from './health-data.component';
import { By } from '@angular/platform-browser';
import { TeamService } from '../../shared/services/team.service';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

describe('HealthDataComponent', () => {
  let teamServiceMock: any;

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
    teamServiceMock = {
      getAllParticipants: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [HealthDataComponent],
      providers: [
        provideRouter([{ path: 'team', component: class {} }]),
        provideAnimationsAsync(),
        providePrimeNG({
          theme: {
            preset: Aura,
            options: {
              darkModeSelector: 'system',
            },
          },
        }),
        { provide: TeamService, useValue: teamServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the health data component', () => {
    const fixture = TestBed.createComponent(HealthDataComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load participants on init', async () => {
    const mockParticipants = [
      { id: 1, firstname: 'John', lastname: 'Doe', dateOfBirth: '1990-01-01' },
    ];
    teamServiceMock.getAllParticipants.mockReturnValue(of(mockParticipants));

    const fixture = TestBed.createComponent(HealthDataComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(teamServiceMock.getAllParticipants).toHaveBeenCalled();
    expect(fixture.componentInstance['participants']()).toEqual(mockParticipants);

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(1);
    expect(rows[0].nativeElement.textContent).toContain('John');
    expect(rows[0].nativeElement.textContent).toContain('Doe');
  });

  it('should contain a back link to team', () => {
    const fixture = TestBed.createComponent(HealthDataComponent);
    fixture.detectChanges();

    const backButton = fixture.debugElement.query(By.css('p-button[routerLink="/team"]'));
    expect(backButton).toBeTruthy();
  });
});
