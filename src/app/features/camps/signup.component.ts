import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CampDto } from '../../shared/models/camp.model';
import { Participant } from '../../shared/models/participant.model';
import {
  CampParticipantMedicationInput,
  CampParticipantSignupInput,
  SignupInput,
} from '../../shared/models/signup.model';
import { CampService } from '../../shared/services/camp.service';
import { ParticipantService } from '../../shared/services/participant.service';
import { SignupService } from '../../shared/services/signup.service';

interface CampParticipantDraft {
  schoolClass: string;
  infosZimmerleitung: string;
  bemerkungen: string;
  drugConsent: boolean | null;
  medications: CampParticipantMedicationInput[];
}

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Button,
    Card,
    Checkbox,
    InputText,
    Message,
    TextareaModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <header
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
            {{ 'features.signup.title' | translate }}
          </h1>
          @if (camp(); as selectedCamp) {
            <p class="text-surface-600 dark:text-surface-300 mt-2 mb-0">
              {{ selectedCamp.title }}
            </p>
          }
        </div>
        <p-button
          [label]="'common.actions.back' | translate"
          icon="pi pi-arrow-left"
          routerLink="/camps"
          severity="secondary"
          class="w-full sm:w-auto"
        />
      </header>

      @if (loadError()) {
        <p-message severity="error" [text]="'features.signup.messages.loadError' | translate" />
      } @else if (camp(); as selectedCamp) {
        @if (hasStarted(selectedCamp)) {
          <p-message severity="warn" [text]="'features.signup.messages.campStarted' | translate" />
        } @else {
          <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-6">
            <div class="flex flex-col gap-6">
              <p-card [header]="'features.signup.sections.signupData' | translate">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-3">
                    <p-checkbox inputId="photoConsent" [binary]="true" [(ngModel)]="photoConsent" />
                    <label for="photoConsent">
                      {{ 'features.signup.form.photoConsent.label' | translate }}
                    </label>
                  </div>

                  <div class="flex items-center gap-3">
                    <p-checkbox inputId="infoEmail" [binary]="true" [(ngModel)]="infoEmail" />
                    <label for="infoEmail">
                      {{ 'features.signup.form.infoEmail.label' | translate }}
                    </label>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label for="additionalContactOptionsDuringCamp" class="font-semibold">
                      {{
                        'features.signup.form.additionalContactOptionsDuringCamp.label' | translate
                      }}
                    </label>
                    <textarea
                      pTextarea
                      id="additionalContactOptionsDuringCamp"
                      [(ngModel)]="additionalContactOptionsDuringCamp"
                      rows="3"
                      [autoResize]="true"
                    ></textarea>
                  </div>
                </div>
              </p-card>

              <p-card [header]="'features.signup.sections.participants' | translate">
                <div class="flex flex-col gap-5">
                  @for (participant of participants(); track participant.id) {
                    <section
                      class="border border-surface-200 dark:border-surface-700 rounded-lg p-4"
                    >
                      <div class="flex items-start gap-3">
                        <p-checkbox
                          [inputId]="'participant-' + participant.id"
                          [binary]="true"
                          [ngModel]="isSelected(participant.id)"
                          (ngModelChange)="setParticipantSelected(participant, $event)"
                        />
                        <div class="flex-1 min-w-0">
                          <label
                            [for]="'participant-' + participant.id"
                            class="font-semibold block"
                          >
                            {{ participant.firstname }} {{ participant.lastname }}
                          </label>
                          <p class="text-sm text-surface-500 mt-1 mb-0">
                            {{ participant.dateOfBirth | date: 'dd.MM.yyyy' }}
                          </p>
                        </div>
                      </div>

                      @if (isSelected(participant.id)) {
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                          <div class="flex flex-col gap-2">
                            <label [for]="'schoolClass-' + participant.id" class="font-semibold">
                              {{ 'features.signup.form.schoolClass.label' | translate }}
                            </label>
                            <input
                              pInputText
                              [id]="'schoolClass-' + participant.id"
                              [ngModel]="participantDraft(participant.id).schoolClass"
                              (ngModelChange)="
                                updateParticipantDraft(participant.id, { schoolClass: $event })
                              "
                            />
                          </div>

                          <div class="flex flex-col gap-2">
                            <label [for]="'drugConsent-' + participant.id" class="font-semibold">
                              {{ 'features.signup.form.drugConsent.label' | translate }}
                            </label>
                            <select
                              [id]="'drugConsent-' + participant.id"
                              class="p-inputtext p-component w-full"
                              [ngModel]="participantDraft(participant.id).drugConsent"
                              (ngModelChange)="
                                updateParticipantDraft(participant.id, { drugConsent: $event })
                              "
                            >
                              <option [ngValue]="null">
                                {{ 'common.actions.select' | translate }}
                              </option>
                              <option [ngValue]="true">
                                {{ 'common.boolean.yes' | translate }}
                              </option>
                              <option [ngValue]="false">
                                {{ 'common.boolean.no' | translate }}
                              </option>
                            </select>
                          </div>

                          <div class="flex flex-col gap-2 md:col-span-2">
                            <label [for]="'infos-' + participant.id" class="font-semibold">
                              {{ 'features.signup.form.infosZimmerleitung.label' | translate }}
                            </label>
                            <textarea
                              pTextarea
                              [id]="'infos-' + participant.id"
                              [ngModel]="participantDraft(participant.id).infosZimmerleitung"
                              (ngModelChange)="
                                updateParticipantDraft(participant.id, {
                                  infosZimmerleitung: $event,
                                })
                              "
                              rows="2"
                              [autoResize]="true"
                            ></textarea>
                          </div>

                          <div class="flex flex-col gap-2 md:col-span-2">
                            <label [for]="'bemerkungen-' + participant.id" class="font-semibold">
                              {{ 'features.signup.form.bemerkungen.label' | translate }}
                            </label>
                            <textarea
                              pTextarea
                              [id]="'bemerkungen-' + participant.id"
                              [ngModel]="participantDraft(participant.id).bemerkungen"
                              (ngModelChange)="
                                updateParticipantDraft(participant.id, { bemerkungen: $event })
                              "
                              rows="2"
                              [autoResize]="true"
                            ></textarea>
                          </div>
                        </div>

                        <div class="mt-5">
                          <div class="flex items-center justify-between gap-3 mb-3">
                            <h3 class="text-base font-semibold m-0">
                              {{ 'features.signup.sections.medication' | translate }}
                            </h3>
                            <p-button
                              [label]="'features.signup.actions.addMedication' | translate"
                              icon="pi pi-plus"
                              size="small"
                              severity="secondary"
                              (click)="addMedication(participant.id)"
                            />
                          </div>

                          @for (
                            medication of medications(participant.id);
                            track trackMedication($index)
                          ) {
                            <div
                              class="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-surface-200 dark:border-surface-700 py-4"
                            >
                              <input
                                pInputText
                                [ngModel]="medication.medicationName"
                                (ngModelChange)="
                                  updateMedication(participant.id, $index, {
                                    medicationName: $event,
                                  })
                                "
                                [placeholder]="
                                  'features.signup.form.medicationName.label' | translate
                                "
                              />
                              <input
                                pInputText
                                [ngModel]="medication.dose"
                                (ngModelChange)="
                                  updateMedication(participant.id, $index, { dose: $event })
                                "
                                [placeholder]="'features.signup.form.dose.label' | translate"
                              />
                              <input
                                pInputText
                                [ngModel]="medication.frequency"
                                (ngModelChange)="
                                  updateMedication(participant.id, $index, { frequency: $event })
                                "
                                [placeholder]="'features.signup.form.frequency.label' | translate"
                              />
                              <input
                                pInputText
                                [ngModel]="medication.purpose"
                                (ngModelChange)="
                                  updateMedication(participant.id, $index, { purpose: $event })
                                "
                                [placeholder]="'features.signup.form.purpose.label' | translate"
                              />
                              <div class="flex items-center gap-3">
                                <p-checkbox
                                  [binary]="true"
                                  [inputId]="'needsHelp-' + participant.id + '-' + $index"
                                  [ngModel]="medication.needsHelp"
                                  (ngModelChange)="
                                    updateMedication(participant.id, $index, {
                                      needsHelp: $event,
                                    })
                                  "
                                />
                                <label [for]="'needsHelp-' + participant.id + '-' + $index">
                                  {{ 'features.signup.form.needsHelp.label' | translate }}
                                </label>
                              </div>
                              <div class="flex justify-end">
                                <p-button
                                  icon="pi pi-trash"
                                  severity="danger"
                                  [rounded]="true"
                                  [text]="true"
                                  (click)="removeMedication(participant.id, $index)"
                                  [attr.aria-label]="'common.actions.remove' | translate"
                                />
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </section>
                  } @empty {
                    <p-message
                      severity="info"
                      [text]="'features.signup.messages.noParticipants' | translate"
                    />
                  }
                </div>
              </p-card>
            </div>

            <aside class="xl:sticky xl:top-24 self-start">
              <p-card [header]="'features.signup.sections.summary' | translate">
                <div class="flex flex-col gap-4">
                  <div>
                    <div class="text-sm text-surface-500">
                      {{ 'features.signup.summary.selectedParticipants' | translate }}
                    </div>
                    <div class="text-2xl font-semibold">{{ selectedCount() }}</div>
                  </div>

                  @if (validationError(); as message) {
                    <p-message severity="warn" [text]="message" />
                  }
                  @if (saveError(); as message) {
                    <p-message severity="error" [text]="message" />
                  }
                  @if (saved()) {
                    <p-message
                      severity="success"
                      [text]="'features.signup.messages.saved' | translate"
                    />
                  }

                  <p-button
                    [label]="'features.signup.actions.saveProgress' | translate"
                    icon="pi pi-save"
                    [loading]="submitting()"
                    [disabled]="!canSubmit() || submitting()"
                    (click)="save(false)"
                    styleClass="w-full"
                  />
                  <p-button
                    [label]="'features.signup.actions.complete' | translate"
                    icon="pi pi-check"
                    [loading]="submitting()"
                    [disabled]="!canSubmit() || submitting()"
                    (click)="save(true)"
                    styleClass="w-full"
                  />
                </div>
              </p-card>
            </aside>
          </div>
        }
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  private readonly campService = inject(CampService);
  private readonly participantService = inject(ParticipantService);
  private readonly signupService = inject(SignupService);
  private readonly translate = inject(TranslateService);

  campId = input.required<string>();

  protected photoConsent = false;
  protected infoEmail = true;
  protected additionalContactOptionsDuringCamp = '';
  protected readonly selectedParticipants = signal<Record<number, CampParticipantDraft>>({});
  protected readonly submitting = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saved = signal(false);
  protected loadError = signal(false);

  protected readonly camp = toSignal(
    toObservable(this.campId).pipe(
      filter((id) => id.length > 0),
      switchMap((id) =>
        this.campService.getById(id).pipe(
          catchError(() => {
            this.loadError.set(true);
            return of(null);
          }),
        ),
      ),
    ),
  );

  protected readonly participants = toSignal(
    this.participantService.getAll().pipe(
      catchError(() => {
        this.loadError.set(true);
        return of([] as Participant[]);
      }),
    ),
    { initialValue: [] as Participant[] },
  );

  protected readonly existingSignup = toSignal(
    toObservable(this.campId).pipe(
      filter((id) => id.length > 0),
      switchMap((id) =>
        this.signupService.getForCamp(id).pipe(
          catchError(() => {
            this.loadError.set(true);
            return of(null);
          }),
        ),
      ),
    ),
  );

  protected readonly selectedCount = computed(
    () => Object.keys(this.selectedParticipants()).length,
  );

  protected readonly validationError = computed(() => {
    if (this.selectedCount() === 0) {
      return this.t('features.signup.messages.selectParticipant');
    }
    if (Object.values(this.selectedParticipants()).some((draft) => draft.drugConsent === null)) {
      return this.t('features.signup.messages.drugConsentRequired');
    }
    return null;
  });

  constructor() {
    effect(() => {
      const signup = this.existingSignup();
      if (!signup) {
        return;
      }

      untracked(() => {
        this.photoConsent = signup.photoConsent;
        this.infoEmail = signup.infoEmail;
        this.additionalContactOptionsDuringCamp = signup.additionalContactOptionsDuringCamp ?? '';
        this.selectedParticipants.set(
          Object.fromEntries(
            signup.campParticipants.map((campParticipant) => [
              campParticipant.participantId,
              {
                schoolClass: campParticipant.schoolClass ?? '',
                infosZimmerleitung: campParticipant.infosZimmerleitung ?? '',
                bemerkungen: campParticipant.bemerkungen ?? '',
                drugConsent: campParticipant.drugConsent,
                medications: campParticipant.medications,
              } satisfies CampParticipantDraft,
            ]),
          ),
        );
      });
    });
  }

  protected canSubmit(): boolean {
    return this.validationError() === null && !this.loadError();
  }

  protected hasStarted(camp: CampDto): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${camp.startDate}T00:00:00`) <= today;
  }

  protected isSelected(participantId: number): boolean {
    return this.selectedParticipants()[participantId] !== undefined;
  }

  protected setParticipantSelected(participant: Participant, selected: boolean): void {
    this.selectedParticipants.update((current) => {
      const next = { ...current };
      if (selected) {
        next[participant.id] = next[participant.id] ?? this.emptyParticipantDraft();
      } else {
        delete next[participant.id];
      }
      return next;
    });
  }

  protected participantDraft(participantId: number): CampParticipantDraft {
    return this.selectedParticipants()[participantId] ?? this.emptyParticipantDraft();
  }

  protected updateParticipantDraft(
    participantId: number,
    patch: Partial<CampParticipantDraft>,
  ): void {
    this.selectedParticipants.update((current) => ({
      ...current,
      [participantId]: {
        ...(current[participantId] ?? this.emptyParticipantDraft()),
        ...patch,
      },
    }));
  }

  protected medications(participantId: number): CampParticipantMedicationInput[] {
    return this.participantDraft(participantId).medications;
  }

  protected addMedication(participantId: number): void {
    const draft = this.participantDraft(participantId);
    this.updateParticipantDraft(participantId, {
      medications: [...draft.medications, this.emptyMedication()],
    });
  }

  protected removeMedication(participantId: number, index: number): void {
    const draft = this.participantDraft(participantId);
    this.updateParticipantDraft(participantId, {
      medications: draft.medications.filter((_, medicationIndex) => medicationIndex !== index),
    });
  }

  protected updateMedication(
    participantId: number,
    index: number,
    patch: Partial<CampParticipantMedicationInput>,
  ): void {
    const draft = this.participantDraft(participantId);
    this.updateParticipantDraft(participantId, {
      medications: draft.medications.map((medication, medicationIndex) =>
        medicationIndex === index ? { ...medication, ...patch } : medication,
      ),
    });
  }

  protected trackMedication(index: number): number {
    return index;
  }

  protected save(completeAfterSave: boolean): void {
    const payload = this.buildPayload();
    if (!payload || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.saveError.set(null);
    this.saved.set(false);

    this.signupService
      .create(payload)
      .pipe(
        switchMap((signup) =>
          completeAfterSave ? this.signupService.complete(signup.id) : of(signup),
        ),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.saved.set(true);
        },
        error: () => {
          this.submitting.set(false);
          this.saveError.set(this.t('features.signup.messages.saveError'));
        },
      });
  }

  private buildPayload(): SignupInput | null {
    if (!this.canSubmit()) {
      return null;
    }

    const campParticipants: CampParticipantSignupInput[] = Object.entries(
      this.selectedParticipants(),
    ).map(([participantId, draft]) => ({
      participantId: Number(participantId),
      schoolClass: this.nullIfBlank(draft.schoolClass),
      infosZimmerleitung: this.nullIfBlank(draft.infosZimmerleitung),
      bemerkungen: this.nullIfBlank(draft.bemerkungen),
      drugConsent: draft.drugConsent ?? false,
      medications: draft.medications
        .filter((medication) => medication.medicationName.trim().length > 0)
        .map((medication) => ({
          medicationName: medication.medicationName.trim(),
          dose: this.nullIfBlank(medication.dose),
          frequency: this.nullIfBlank(medication.frequency),
          purpose: this.nullIfBlank(medication.purpose),
          needsHelp: medication.needsHelp,
          confidential: medication.confidential,
        })),
    }));

    return {
      campId: this.campId(),
      photoConsent: this.photoConsent,
      infoEmail: this.infoEmail,
      additionalContactOptionsDuringCamp: this.nullIfBlank(this.additionalContactOptionsDuringCamp),
      campParticipants,
    };
  }

  private emptyParticipantDraft(): CampParticipantDraft {
    return {
      schoolClass: '',
      infosZimmerleitung: '',
      bemerkungen: '',
      drugConsent: null,
      medications: [],
    };
  }

  private emptyMedication(): CampParticipantMedicationInput {
    return {
      medicationName: '',
      dose: null,
      frequency: null,
      purpose: null,
      needsHelp: false,
      confidential: false,
    };
  }

  private nullIfBlank(value: string | null): string | null {
    const trimmed = value?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : null;
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
