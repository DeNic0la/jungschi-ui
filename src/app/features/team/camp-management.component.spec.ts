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
import { CampManagementComponent } from './camp-management.component';
import { CampService } from '../../shared/services/camp.service';
import { provideTranslateTesting } from '../../shared/testing/translate-testing';

describe('CampManagementComponent', () => {
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

  it('creates camps with normalized text values', async () => {
    const campService = {
      getAll: vi.fn().mockReturnValue(of([])),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [CampManagementComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura } }),
        provideTranslateTesting(),
        { provide: CampService, useValue: campService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CampManagementComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance['draft'] = {
      id: ' summer-2028 ',
      title: ' Sommerlager 2028 ',
      description: '  ',
      startDate: '2028-07-10',
      endDate: '2028-07-17',
      signupEndDate: '2028-06-01',
      isJugendUndSport: true,
      priceFirst: 120,
      priceSecond: 100,
      priceThird: 80,
    };

    fixture.componentInstance['saveCamp']();

    expect(campService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'summer-2028',
        title: 'Sommerlager 2028',
        description: null,
      }),
    );
  });
});
