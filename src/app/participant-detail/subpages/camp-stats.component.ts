import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, take, catchError, of } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { Message } from 'primeng/message';
import { ParticipantService } from '../../services/participant.service';
import { CampStatsDto } from '../../models/participant.model';
import { CanComponentDeactivate } from '../../pending-changes.guard';

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
          <i class="pi pi-spin pi-spinner spinner-icon" aria-hidden="true"></i>
          <span class="sr-only">Laden...</span>
        </div>
      } @else if (error()) {
        <p-message severity="error" [text]="error()!"/>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="camp-form">
          <div class="field">
            <label id="vaccinated-label" class="font-bold">Zecken Impfung gemacht</label>
            <div class="radio-group" role="radiogroup" aria-labelledby="vaccinated-label">
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isTickVaccinated"
                  formControlName="isTickVaccinated"
                  [value]="true"
                  inputId="vaccinated-yes"></p-radiobutton>
                <label for="vaccinated-yes">Ja</label>
              </div>
              <div class="flex items-center gap-2">
                <p-radiobutton
                  name="isTickVaccinated"
                  formControlName="isTickVaccinated"
                  [value]="false"
                  inputId="vaccinated-no"></p-radiobutton>
                <label for="vaccinated-no">Nein</label>
              </div>
            </div>
          </div>

          <div class="field">
            <label id="drug-consent-label" class="font-bold">Einverständnis zur Medikamentenabgabe</label>
            <div class="radio-group vertical" role="radiogroup" aria-labelledby="drug-consent-label">
              <div class="flex items-start gap-2">
                <p-radiobutton
                  name="drugConsent"
                  formControlName="drugConsent"
                  [value]="true"
                  inputId="drug-consent-yes"></p-radiobutton>
                <label for="drug-consent-yes" class="consent-label">
                  Ja, die Lagerleitung darf meinem Kind bei leichten Schmerzen Medikamente verabreichen (z.B. Dafalgan) oder Crème auftragen (z.B. Bepanthen)
                </label>
              </div>
              <div class="flex items-start gap-2">
                <p-radiobutton
                  name="drugConsent"
                  formControlName="drugConsent"
                  [value]="false"
                  inputId="drug-consent-no"></p-radiobutton>
                <label for="drug-consent-no" class="consent-label">
                  Nein, ich möchte nicht, dass die Lagerleitung meinem Kind bei einem kleinen Unfall/Krankheit leichte Medikamente (z.B. Dafalgan, Bepanthen) verabreicht. Ich möchte in diesem Fall zuerst telefonisch informiert werden.
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
              rows="3"></textarea>
          </div>

          <div class="form-actions">
            <p-button
              label="Speichern"
              type="submit"
              [loading]="saving()"
              icon="pi pi-save"
              [disabled]="form.pristine || form.invalid"/>
            @if (saved()) {
              <p-message severity="success" text="Gespeichert!"/>
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
    .camp-form {
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
    .spinner-icon {
      font-size: 2rem;
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
    .font-bold {
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampStatsComponent implements CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly participantService = inject(ParticipantService);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    isTickVaccinated: this.fb.control<null|boolean>(null, Validators.required),
    drugConsent:  this.fb.control<null|boolean>(null, Validators.required),
    ahv: [''],
    krankenkasse: [''],
    sonstiges: [''],
  });

  constructor() {
    this.route.parent?.paramMap.pipe(
        map((params) => params.get('id')),
        switchMap((id) => {
          const numId = Number(id);
          if (!id || isNaN(numId)) return of(null);
          return this.participantService.getCampStats(numId).pipe(
            catchError(() => {
              this.error.set('Fehler beim Laden der Daten.');
              return of(null);
            })
          );
        }),
        take(1)
      )
      .subscribe((stats) => {
        if (stats) {
          this.form.patchValue(stats);
          this.form.markAsPristine();
        }
        this.loading.set(false);
      });
  }

  save() {
    const participantId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (this.form.invalid || isNaN(participantId)) return;

    this.saving.set(true);
    this.saved.set(false);

    const dto = this.form.value as CampStatsDto;

    this.participantService.updateCampStats(participantId, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.form.markAsPristine();
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Fehler beim Speichern der Daten.');
      },
    });
  }

  isDirty(): boolean {
    return this.form.dirty;
  }
}
