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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, catchError, of, filter, timer, startWith, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { Message } from 'primeng/message';
import { ParticipantService } from '../../../shared/services/participant.service';
import { CampStatsDto } from '../../../shared/models/participant.model';
import { CanComponentDeactivate } from '../../../shared/guards/pending-changes.guard';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CampService } from '../../../shared/services/camp.service';
import { CampDto } from '../../../shared/models/camp.model';

@Component({
  selector: 'app-camp-stats',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    InputText,
    TextareaModule,
    RadioButton,
    Message,
    TranslatePipe,
  ],
  template: `
    <section>
      <h2>{{ 'features.participantDetail.campStats.title' | translate }}</h2>

      <div class="camp-list">
        <h3 class="font-bold">{{ 'features.participantDetail.campStats.availableCamps' | translate }}</h3>
        @if (camps(); as campEntries) {
          @if (campEntries.length === 0) {
            <p class="text-sm italic">{{ 'common.empty.noEntries' | translate }}</p>
          } @else {
            <div class="flex flex-col gap-2">
              @for (camp of campEntries; track camp.id) {
                <div class="camp-item">
                  <div class="flex items-center justify-between gap-2">
                    <div>
                      <div class="font-bold">{{ camp.title }}</div>
                      <div class="text-sm">{{ camp.startDate | date: 'dd.MM.yyyy' }} - {{ camp.endDate | date: 'dd.MM.yyyy' }}</div>
                    </div>
                    <p-button
                      [label]="'common.actions.view' | translate"
                      size="small"
                      severity="secondary"
                      (click)="loadCampDetail(camp.id)"
                    />
                  </div>
                </div>
              }
            </div>
          }
        }

        @if (selectedCampLoading()) {
          <p-message severity="info" [text]="'common.status.loadingData' | translate" />
        }
        @if (selectedCampError(); as campError) {
          <p-message severity="error" [text]="campError" />
        }
        @if (selectedCamp(); as campDetail) {
          <div class="camp-item">
            <div class="font-bold">{{ campDetail.title }}</div>
            <div class="text-sm">{{ campDetail.description || '-' }}</div>
            <div class="text-sm mt-2">
              Signup end: {{ campDetail.signupEndDate | date: 'dd.MM.yyyy' }}
            </div>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="loading-container">
          <p-message
            severity="info"
            [text]="'features.participantDetail.campStats.messages.loading' | translate"
          />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="camp-stats-form">
          <div class="field">
            <label id="vaccinated-label" class="font-bold">
              {{ 'features.participantDetail.campStats.form.tickVaccinated.label' | translate }}
            </label>
            <div class="radio-group" role="radiogroup" aria-labelledby="vaccinated-label">
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isTickVaccinated"
                  formControlName="isTickVaccinated"
                  [value]="true"
                  inputId="vaccinated-yes"
                />
                <label for="vaccinated-yes">{{ 'common.boolean.yes' | translate }}</label>
              </div>
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isTickVaccinated"
                  formControlName="isTickVaccinated"
                  [value]="false"
                  inputId="vaccinated-no"
                />
                <label for="vaccinated-no">{{ 'common.boolean.no' | translate }}</label>
              </div>
            </div>
          </div>

          <div class="field">
            <label for="ahv" class="font-bold">
              {{ 'features.participantDetail.campStats.form.ahv.label' | translate }}
            </label>
            <input pInputText id="ahv" formControlName="ahv" placeholder="756.xxxx.xxxx.xx" />
          </div>

          <div class="field">
            <label for="krankenkasse" class="font-bold">
              {{ 'features.participantDetail.campStats.form.krankenkasse.label' | translate }}
            </label>
            <input pInputText id="krankenkasse" formControlName="krankenkasse" />
          </div>

          <div class="field">
            <label for="krankenkassenNr" class="font-bold">
              {{ 'features.participantDetail.campStats.form.krankenkassenNr.label' | translate }}
            </label>
            <input pInputText id="krankenkassenNr" formControlName="krankenkassenNr" />
          </div>

          <div class="field">
            <label for="familyDoctor" class="font-bold">
              {{ 'features.participantDetail.campStats.form.familyDoctor.label' | translate }}
            </label>
            <input pInputText id="familyDoctor" formControlName="familyDoctor" />
          </div>

          <div class="field">
            <label for="nationality" class="font-bold">
              {{ 'features.participantDetail.campStats.form.nationality.label' | translate }}
            </label>
            <input pInputText id="nationality" formControlName="nationality" />
          </div>

          <div class="field">
            <label for="nativeLanguage" class="font-bold">
              {{ 'features.participantDetail.campStats.form.nativeLanguage.label' | translate }}
            </label>
            <input pInputText id="nativeLanguage" formControlName="nativeLanguage" />
          </div>

          <div class="field">
            <label for="foodPreferences" class="font-bold">
              {{ 'features.participantDetail.campStats.form.foodPreferences.label' | translate }}
            </label>
            <textarea
              pTextarea
              id="foodPreferences"
              formControlName="foodPreferences"
              [autoResize]="true"
              rows="3"
            ></textarea>
          </div>

          <div class="field">
            <label for="notes" class="font-bold">
              {{ 'features.participantDetail.campStats.form.notes.label' | translate }}
            </label>
            <textarea
              pTextarea
              id="notes"
              formControlName="notes"
              [autoResize]="true"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <p-button
              [label]="'features.participantDetail.campStats.actions.save' | translate"
              type="submit"
              [loading]="saving()"
              icon="pi pi-save"
              [disabled]="form.pristine || form.invalid || saving()"
            />
            @if (saved()) {
              <p-message
                severity="success"
                [text]="'common.status.savedSuccessfully' | translate"
              />
            }
            @if (error(); as err) {
              <p-message severity="error" [text]="err" />
            }
          </div>
        </form>
      }
    </section>
  `,
  styles: `
    section {
      padding: 1rem 0;
    }
    .camp-stats-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
    }
    .camp-list {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 800px;
    }
    .camp-item {
      border: 1px solid var(--p-content-border-color);
      border-radius: 0.5rem;
      padding: 0.75rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .radio-group {
      display: flex;
      gap: 2rem;
    }
    .radio-group.vertical {
      flex-direction: column;
      gap: 1rem;
    }
    .consent-label {
      line-height: 1.4;
    }
    .form-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .font-bold {
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampStatsComponent implements CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly participantService = inject(ParticipantService);
  private readonly campService = inject(CampService);
  private readonly translate = inject(TranslateService);

  // Router param input (via withComponentInputBinding)
  id = input.required<string>();

  protected readonly form = this.fb.group({
    isTickVaccinated: this.fb.control<null | boolean>(null, Validators.required),
    ahv: [''],
    krankenkasse: [''],
    krankenkassenNr: [''],
    familyDoctor: [''],
    nationality: [''],
    nativeLanguage: [''],
    foodPreferences: [''],
    notes: [''],
  });

  protected readonly camps = toSignal(
    this.campService.getAll().pipe(
      catchError((err) => {
        console.error('Failed to load camps:', err);
        return of([] as CampDto[]);
      }),
    ),
    { initialValue: [] as CampDto[] },
  );

  // Load stats declaratively
  private readonly statsResource = toSignal(
    toObservable(this.id).pipe(
      map((id: string) => Number(id)),
      filter((numId: number) => !isNaN(numId)),
      switchMap((numId: number) => {
        return this.participantService.getCampStats(numId).pipe(
          catchError((err) => {
            console.error('Failed to load camp stats:', err);
            this.error.set(this.t('features.participantDetail.campStats.messages.loadError'));
            return of(null);
          }),
        );
      }),
    ),
  );

  protected readonly loading = computed(() => this.statsResource() === undefined);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedCamp = signal<CampDto | null>(null);
  protected readonly selectedCampLoading = signal(false);
  protected readonly selectedCampError = signal<string | null>(null);

  private readonly savedTrigger = new Subject<boolean>();
  protected readonly saved = toSignal(
    this.savedTrigger.pipe(
      switchMap((v) =>
        v
          ? timer(3000).pipe(
              map(() => false),
              startWith(true),
            )
          : of(false),
      ),
    ),
    { initialValue: false },
  );

  constructor() {
    // Synchronize form with loaded stats
    effect(() => {
      const stats = this.statsResource();
      if (stats) {
        untracked(() => {
          this.form.patchValue(stats);
          this.form.markAsPristine();
        });
      }
    });
  }

  protected save(): void {
    const participantId = Number(this.id());
    if (this.form.invalid || isNaN(participantId)) return;

    this.saving.set(true);

    const dto = this.form.getRawValue() as CampStatsDto;

    this.participantService.updateCampStats(participantId, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.savedTrigger.next(true);
        this.form.markAsPristine();
      },
      error: (err) => {
        console.error('Failed to update camp stats:', err);
        this.saving.set(false);
        this.error.set(this.t('common.status.saveFailed'));
      },
    });
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  protected loadCampDetail(campId: string): void {
    this.selectedCampLoading.set(true);
    this.selectedCampError.set(null);
    this.campService.getById(campId).subscribe({
      next: (camp) => {
        this.selectedCamp.set(camp);
        this.selectedCampLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load camp detail:', err);
        this.selectedCampError.set(this.t('features.participantDetail.campStats.messages.loadError'));
        this.selectedCampLoading.set(false);
      },
    });
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
