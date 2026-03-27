import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
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
  ],
  template: `
    <section>
      <h2>Lager Daten</h2>

      @if (loading()) {
        <div class="loading-container">
          <p-message severity="info" text="Lagerdaten werden geladen..." />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="camp-stats-form">
          <div class="field">
            <label id="vaccinated-label" class="font-bold">Zecken Impfung gemacht</label>
            <div class="radio-group" role="radiogroup" aria-labelledby="vaccinated-label">
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isTickVaccinated"
                  formControlName="isTickVaccinated"
                  [value]="true"
                  inputId="vaccinated-yes"
                />
                <label for="vaccinated-yes">Ja</label>
              </div>
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isTickVaccinated"
                  formControlName="isTickVaccinated"
                  [value]="false"
                  inputId="vaccinated-no"
                />
                <label for="vaccinated-no">Nein</label>
              </div>
            </div>
          </div>

          <div class="field">
            <label id="drug-consent-label" class="font-bold">
              Einverständnis zur Medikamentenabgabe
            </label>
            <div
              class="radio-group vertical"
              role="radiogroup"
              aria-labelledby="drug-consent-label"
            >
              <div class="flex items-start gap-2">
                <p-radiobutton
                  name="drugConsent"
                  formControlName="drugConsent"
                  [value]="true"
                  inputId="drug-consent-yes"
                />
                <label for="drug-consent-yes" class="consent-label">
                  Ja, die Lagerleitung darf meinem Kind bei leichten Schmerzen Medikamente
                  verabreichen (z.B. Dafalgan) oder Crème auftragen (z.B. Bepanthen)
                </label>
              </div>
              <div class="flex items-start gap-2">
                <p-radiobutton
                  name="drugConsent"
                  formControlName="drugConsent"
                  [value]="false"
                  inputId="drug-consent-no"
                />
                <label for="drug-consent-no" class="consent-label">
                  Nein, ich möchte nicht, dass die Lagerleitung meinem Kind bei einem kleinen
                  Unfall/Krankheit leichte Medikamente (z.B. Dafalgan, Bepanthen) verabreicht. Ich
                  möchte in diesem Fall zuerst telefonisch informiert werden.
                </label>
              </div>
            </div>
          </div>

          <div class="field">
            <label for="ahv" class="font-bold">AHV Nummer</label>
            <input pInputText id="ahv" formControlName="ahv" placeholder="756.xxxx.xxxx.xx" />
          </div>

          <div class="field">
            <label for="krankenkasse" class="font-bold">Krankenkasse</label>
            <input pInputText id="krankenkasse" formControlName="krankenkasse" />
          </div>

          <div class="field">
            <label for="sonstiges" class="font-bold">Sonstiges</label>
            <textarea
              pTextarea
              id="sonstiges"
              formControlName="sonstiges"
              [autoResize]="true"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <p-button
              label="Lagerdaten speichern"
              type="submit"
              [loading]="saving()"
              icon="pi pi-save"
              [disabled]="form.pristine || form.invalid || saving()"
            />
            @if (saved()) {
              <p-message severity="success" text="Erfolgreich gespeichert!" />
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

  // Router param input (via withComponentInputBinding)
  id = input.required<string>();

  protected readonly form = this.fb.group({
    isTickVaccinated: this.fb.control<null | boolean>(null, Validators.required),
    drugConsent: this.fb.control<null | boolean>(null, Validators.required),
    ahv: [''],
    krankenkasse: [''],
    sonstiges: [''],
  });

  // Load stats declaratively
  private readonly statsResource = toSignal(
    toObservable(this.id).pipe(
      map((id: string) => Number(id)),
      filter((numId: number) => !isNaN(numId)),
      switchMap((numId: number) => {
        return this.participantService.getCampStats(numId).pipe(
          catchError((err) => {
            console.error('Failed to load camp stats:', err);
            this.error.set('Daten konnten nicht geladen werden.');
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
        this.error.set('Speichern fehlgeschlagen.');
      },
    });
  }

  isDirty(): boolean {
    return this.form.dirty;
  }
}
