import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ParticipantDetailComponent } from './participant-detail.component';
import { ParticipantService } from '../services/participant.service';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { By } from '@angular/platform-browser';

describe('ParticipantDetailComponent', () => {
  let participantServiceMock: any;

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

    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    });
  });

  beforeEach(async () => {
    participantServiceMock = {
      get: vi.fn().mockReturnValue(of({
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: '1990-01-01',
        lastUpdatedAt: '2026-03-19T00:00:00'
      })),
    };

    await TestBed.configureTestingModule({
      imports: [ParticipantDetailComponent],
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
        { provide: ParticipantService, useValue: participantServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the participant detail component', () => {
    const fixture = TestBed.createComponent(ParticipantDetailComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load participant details based on id', async () => {
    const mockParticipant = {
      id: 123,
      firstname: 'Max',
      lastname: 'Mustermann',
      dateOfBirth: '2010-05-20',
      lastUpdatedAt: '2026-03-19T10:00:00',
    };
    participantServiceMock.get.mockReturnValue(of(mockParticipant));

    const fixture = TestBed.createComponent(ParticipantDetailComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('id', '123');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(participantServiceMock.get).toHaveBeenCalledWith(123);
    expect(component.participant()).toEqual(mockParticipant);

    const cardHeader = fixture.debugElement.query(By.css('.p-card-title')).nativeElement.textContent;
    expect(cardHeader).toContain('Max');
    expect(cardHeader).toContain('Mustermann');

    const tabs = fixture.debugElement.query(By.css('p-tabs'));
    expect(tabs).toBeTruthy();

    const tabList = fixture.debugElement.query(By.css('p-tablist'));
    expect(tabList.nativeElement.textContent).toContain('Übersicht');
    expect(tabList.nativeElement.textContent).toContain('Gesundheitsinfo');
    expect(tabList.nativeElement.textContent).toContain('Lager Daten');
    expect(tabList.nativeElement.textContent).toContain('Allergien');
    expect(tabList.nativeElement.textContent).toContain('Essen');
  });

  it('should show loading state when participant is not loaded', () => {
    // Return an observable that hasn't emitted yet to simulate loading
    participantServiceMock.get.mockReturnValue(of());
    const fixture = TestBed.createComponent(ParticipantDetailComponent);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('.pi-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should show error state when participant is not found', async () => {
    participantServiceMock.get.mockReturnValue(of(null));
    const fixture = TestBed.createComponent(ParticipantDetailComponent);
    fixture.componentRef.setInput('id', '999');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorCard = fixture.debugElement.query(By.css('p-card[header="Fehler"]'));
    expect(errorCard).toBeTruthy();
    expect(errorCard.nativeElement.textContent).toContain('999');
  });
});
