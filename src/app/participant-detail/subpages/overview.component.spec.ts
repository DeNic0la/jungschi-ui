import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ParticipantOverviewComponent } from './overview.component';
import { ParticipantService } from '../../services/participant.service';
import { By } from '@angular/platform-browser';

describe('ParticipantOverviewComponent', () => {
  let participantServiceMock: any;
  let activatedRouteMock: any;

  beforeEach(async () => {
    participantServiceMock = {
      info: vi.fn().mockReturnValue(of({
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: '1990-01-01',
        lastUpdatedAt: '2026-03-19T00:00:00',
        healthStats: true,
        campStats: false
      })),
    };

    activatedRouteMock = {
      parent: {
        paramMap: of({
          get: (key: string) => (key === 'id' ? '1' : null)
        })
      }
    };

    await TestBed.configureTestingModule({
      imports: [ParticipantOverviewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ParticipantService, useValue: participantServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the overview component', () => {
    const fixture = TestBed.createComponent(ParticipantOverviewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load and display participant data', async () => {
    const fixture = TestBed.createComponent(ParticipantOverviewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const grid = fixture.debugElement.query(By.css('.detail-grid'));
    expect(grid).toBeTruthy();
    expect(grid.nativeElement.textContent).toContain('01.01.1990');
    expect(grid.nativeElement.textContent).toContain('19.03.2026');

    // Should not contain ID
    expect(grid.nativeElement.textContent).not.toContain('ID');

    // Checkboxes should be present
    const checkboxes = fixture.debugElement.queryAll(By.css('p-checkbox'));
    expect(checkboxes.length).toBe(2);
  });
});
