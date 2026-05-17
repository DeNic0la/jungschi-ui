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
import { TextareaModule } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { Message } from 'primeng/message';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ParticipantService } from '../../../shared/services/participant.service';
import { HealthStatsDto } from '../../../shared/models/participant.model';
import { CanComponentDeactivate } from '../../../shared/guards/pending-changes.guard';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-health-stats',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    TextareaModule,
    RadioButton,
    Message,
    ConfirmDialog,
    TranslatePipe,
  ],
  template: `
    <section>
      <p-confirmdialog />
      <h2>{{ 'features.participantDetail.healthStats.title' | translate }}</h2>

      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner spinner-icon" aria-hidden="true"></i>
          <span class="sr-only">{{ 'common.status.loading' | translate }}</span>
        </div>
      } @else if (error()) {
        <p-message severity="error" [text]="error()!" />
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="health-form">
          <div class="field">
            <label id="healthy-label">
              {{ 'features.participantDetail.healthStats.form.isHealthy.label' | translate }}
            </label>
            <div class="radio-group" role="radiogroup" aria-labelledby="healthy-label">
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isHealthy"
                  formControlName="isHealthy"
                  [value]="true"
                  inputId="healthy-yes"
                ></p-radiobutton>
                <label for="healthy-yes">{{ 'common.boolean.yes' | translate }}</label>
              </div>
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isHealthy"
                  formControlName="isHealthy"
                  [value]="false"
                  inputId="healthy-no"
                ></p-radiobutton>
                <label for="healthy-no">{{ 'common.boolean.no' | translate }}</label>
              </div>
            </div>
          </div>

          @if (isHealthyValue() === false) {
            <div class="field">
              <label for="healthyReason">
                {{ 'features.participantDetail.healthStats.form.healthyReason.label' | translate }}
              </label>
              <textarea
                pTextarea
                id="healthyReason"
                formControlName="healthyReason"
                [autoResize]="true"
                rows="3"
              ></textarea>
            </div>

            <div class="field">
              <label for="excludedActivities">
                {{
                  'features.participantDetail.healthStats.form.excludedActivities.label' | translate
                }}
              </label>
              <textarea
                pTextarea
                id="excludedActivities"
                formControlName="excludedActivities"
                [autoResize]="true"
                rows="3"
              ></textarea>
            </div>
          }

          <div class="form-actions">
            <p-button
              [label]="'common.actions.save' | translate"
              type="submit"
              [loading]="saving()"
              icon="pi pi-save"
              [disabled]="form.pristine || form.invalid"
            />

            <p-button
              id="delete-btn"
              [label]="'common.actions.delete' | translate"
              type="button"
              severity="danger"
              class="hidden"
              variant="text"
              icon="pi pi-trash"
              (click)="delete()"
              [disabled]="loading() || saving()"
            />

            @if (saved()) {
              <p-message severity="success" [text]="'common.status.saved' | translate" />
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
    .hidden {
      display: none;
    }
    .health-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .field label {
      font-weight: 600;
      color: var(--p-text-color);
    }
    .radio-group {
      display: flex;
      gap: 2rem;
      margin-top: 0.5rem;
    }
    .flex {
      display: flex;
    }
    .items-center {
      align-items: center;
    }
    .gap-2 {
      gap: 0.5rem;
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
      align-items: center;
      padding: 2rem 0;
    }
    .spinner-icon {
      font-size: 2rem;
      color: var(--p-primary-color);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthStatsComponent implements CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly participantService = inject(ParticipantService);
  private readonly translate = inject(TranslateService);

  // Participant ID from route (via withComponentInputBinding)
  id = input.required<string>();

  protected readonly form = this.fb.group({
    isHealthy: this.fb.control<null | boolean>(null, Validators.required),
    healthyReason: [''],
    excludedActivities: [''],
  });

  protected readonly isHealthyValue = toSignal(this.form.controls.isHealthy.valueChanges, {
    initialValue: this.form.controls.isHealthy.value ?? true,
  });

  // Load stats declaratively
  private readonly statsResource = toSignal(
    toObservable(this.id).pipe(
      map((id: string) => Number(id)),
      filter((numId: number) => !isNaN(numId)),
      switchMap((numId: number) => {
        return this.participantService.getHealthStats(numId).pipe(
          catchError((err) => {
            console.error('Failed to load health stats:', err);
            this.error.set(this.t('features.participantDetail.healthStats.messages.loadError'));
            return of(null);
          }),
        );
      }),
    ),
  );

  protected readonly loading = computed(() => this.statsResource() === undefined);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

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

  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    // Synchronize form with loaded stats
    effect(() => {
      const stats = this.statsResource();
      if (stats) {
        untracked(() => {
          this.form.patchValue({
            isHealthy: stats.isHealthy,
            healthyReason: stats.healthyReason ?? '',
            excludedActivities: stats.excludedActivities ?? '',
          });
          this.form.markAsPristine();
        });
      }
    });

    // Clear reasons when isHealthy is set to true
    effect(() => {
      if (this.isHealthyValue() === true) {
        untracked(() => {
          this.form.patchValue({
            healthyReason: '',
            excludedActivities: '',
          });
        });
      }
    });
  }

  protected save(): void {
    const participantId = Number(this.id());
    if (this.form.invalid || isNaN(participantId)) return;

    this.saving.set(true);

    const dto: HealthStatsDto = {
      isHealthy: this.form.value.isHealthy ?? true,
      healthyReason: this.form.value.healthyReason || null,
      excludedActivities: this.form.value.excludedActivities || null,
    };

    this.participantService.updateHealthStats(participantId, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.savedTrigger.next(true);
        this.form.markAsPristine();
      },
      error: (err) => {
        console.error('Failed to update health stats:', err);
        this.saving.set(false);
        this.error.set(this.t('common.status.saveFailed'));
      },
    });
  }

  protected delete(): void {
    this.confirmationService.confirm({
      message: this.t('features.participantDetail.healthStats.confirmDelete.message'),
      header: this.t('features.participantDetail.healthStats.confirmDelete.header'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t('common.actions.delete'),
      rejectLabel: this.t('common.actions.cancel'),
      accept: () => {
        this.form.patchValue({
          isHealthy: true,
          healthyReason: '',
          excludedActivities: '',
        });
        this.form.markAsDirty();
        this.save();
      },
    });
  }

  // Used by CanDeactivate guard
  isDirty(): boolean {
    return this.form.dirty;
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
