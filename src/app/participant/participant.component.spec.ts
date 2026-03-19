import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ParticipantComponent } from './participant.component';
import { ParticipantService } from '../services/participant.service';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService, ConfirmationService } from 'primeng/api';

describe('ParticipantComponent', () => {
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
  });

  beforeEach(async () => {
    participantServiceMock = {
      getAll: vi.fn().mockReturnValue(of([])),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [ParticipantComponent, ReactiveFormsModule],
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
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();
  });

  it('should create the participant component', () => {
    const fixture = TestBed.createComponent(ParticipantComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load participants on init', async () => {
    const mockParticipants = [
      {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: '1990-01-01',
        lastUpdatedAt: '2026-03-19T00:00:00',
      },
    ];
    participantServiceMock.getAll.mockReturnValue(of(mockParticipants));

    const fixture = TestBed.createComponent(ParticipantComponent);
    const component = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();

    expect(participantServiceMock.getAll).toHaveBeenCalled();
    expect(component['participants']()).toEqual(mockParticipants);
  });

  it('should open dialog for adding', () => {
    const fixture = TestBed.createComponent(ParticipantComponent);
    const component = fixture.componentInstance;

    component['openAddDialog']();

    expect(component['displayDialog']()).toBe(true);
    expect(component['isEdit']()).toBe(false);
  });

  it('should open dialog for editing and patch values', () => {
    const fixture = TestBed.createComponent(ParticipantComponent);
    const component = fixture.componentInstance;
    const participant = {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      dateOfBirth: '1990-01-01',
      lastUpdatedAt: '2026-03-19T00:00:00',
    };

    component['openEditDialog'](participant);

    expect(component['displayDialog']()).toBe(true);
    expect(component['isEdit']()).toBe(true);
    expect(component['participantForm'].get('firstname')?.value).toBe('John');
    expect(component['participantForm'].get('lastname')?.value).toBe('Doe');
    // Date of birth will be a Date object
    expect(component['participantForm'].get('dateOfBirth')?.value).toBeInstanceOf(Date);
  });
});
