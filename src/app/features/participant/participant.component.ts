import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ParticipantService } from '../../shared/services/participant.service';
import { Participant, ParticipantInput } from '../../shared/models/participant.model';
import { firstValueFrom, fromEvent, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-participant',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    RouterLink,
    TableModule,
    Dialog,
    InputText,
    DatePicker,
    Toast,
    ConfirmDialog,
    Card,
  ],
  template: `
    <div class="page-container">
      <p-toast />
      <p-confirmdialog />

      <header class="flex-header">
        <h1>Teilnehmer</h1>
        <p-button styleClass="block lg:hidden" icon="pi pi-plus" (click)="openAddDialog()" />
        <p-button styleClass="hidden lg:block" label="Neuer Teilnehmer" icon="pi pi-plus" (click)="openAddDialog()" />
      </header>

      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner spinner-icon"></i>
        </div>
      } @else {

          <div class="card-grid">
            @for (participant of participants(); track participant.id) {
              <p-card class="participant-card">
                <ng-template #header>
                  <div class="card-header-content" [routerLink]="['/participants', participant.id]">
                    <span class="participant-name">
                      {{ participant.firstname }} {{ participant.lastname }}
                    </span>
                  </div>
                </ng-template>
                <div class="card-content" [routerLink]="['/participants', participant.id]">
                  <div class="info-item">
                    <span class="label">Geburtsdatum:</span>
                    <span>{{ participant.dateOfBirth | date: 'dd.MM.yyyy' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Zuletzt aktualisiert:</span>
                    <span>{{ participant.lastUpdatedAt | date: 'dd.MM.yyyy HH:mm' }}</span>
                  </div>
                </div>
                <ng-template #footer>
                  <div class="actions-cell">
                    <p-button
                      icon="pi pi-eye"
                      [rounded]="true"
                      severity="info"
                      [routerLink]="['/participants', participant.id]"
                      aria-label="Anzeigen"
                    />
                    <p-button
                      icon="pi pi-pencil"
                      [rounded]="true"
                      severity="secondary"
                      (click)="openEditDialog(participant)"
                      aria-label="Bearbeiten"
                    />
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      severity="danger"
                      (click)="confirmDelete(participant)"
                      aria-label="Löschen"
                    />
                  </div>
                </ng-template>
              </p-card>
            } @empty {
              <div class="empty-message">Keine Teilnehmer gefunden.</div>
            }
          </div>

      }

      <p-dialog
        [header]="isEdit() ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'"
        [(visible)]="displayDialog"
        [modal]="true"
        [style]="{ width: '90%', maxWidth: '450px' }"
        (onHide)="closeDialog()"
      >
        <form [formGroup]="participantForm" (ngSubmit)="saveParticipant()" class="participant-form">
          <div class="field">
            <label for="firstname">Vorname</label>
            <input
              pInputText
              id="firstname"
              formControlName="firstname"
              autocomplete="given-name"
            />
            @if (
              participantForm.get('firstname')?.invalid && participantForm.get('firstname')?.touched
            ) {
              <small class="error-text">Vorname ist erforderlich.</small>
            }
          </div>

          <div class="field">
            <label for="lastname">Nachname</label>
            <input pInputText id="lastname" formControlName="lastname" autocomplete="family-name" />
            @if (
              participantForm.get('lastname')?.invalid && participantForm.get('lastname')?.touched
            ) {
              <small class="error-text">Nachname ist erforderlich.</small>
            }
          </div>

          <div class="field">
            <label for="dateOfBirthInput">Geburtsdatum</label>
            <p-datepicker
              id="dateOfBirth"
              formControlName="dateOfBirth"
              dateFormat="dd.mm.yy"
              appendTo="body"
              [showIcon]="true"
              inputId="dateOfBirthInput"
            />
            @if (
              participantForm.get('dateOfBirth')?.invalid &&
              participantForm.get('dateOfBirth')?.touched
            ) {
              <small class="error-text">Geburtsdatum ist erforderlich.</small>
            }
          </div>

          <div class="form-actions">
            <p-button
              label="Abbrechen"
              severity="secondary"
              type="button"
              (click)="closeDialog()"
            />
            <p-button
              label="Speichern"
              [loading]="saving()"
              type="submit"
              [disabled]="participantForm.invalid"
            />
          </div>
        </form>
      </p-dialog>
    </div>
  `,
  styles: `
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .participant-card {
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .participant-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .card-header-content {
      padding: 1.25rem 1.5rem 0.5rem;
      border-bottom: 1px solid var(--p-content-border-color);
    }

    .participant-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--p-primary-color);
      display: block;
    }

    .card-content {
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }

    .info-item .label {
      color: var(--p-text-muted-color);
    }

    .actions-cell {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 0 1.5rem 1.25rem;
    }

    .empty-message {
      text-align: center;
      padding: 3rem;
      color: var(--p-text-muted-color);
      font-style: italic;
      grid-column: 1 / -1;
    }

    .participant-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-top: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field label {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .field input,
    .field p-datepicker {
      width: 100%;
    }

    .error-text {
      color: var(--p-red-500);
      font-size: 0.75rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .spinner-icon {
      font-size: 2.5rem;
      color: var(--p-primary-color);
    }

    :host ::ng-deep .p-card-body {
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    :host ::ng-deep .p-card-content {
      padding: 0;
      flex-grow: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly participantService = inject(ParticipantService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly isMobile = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth < 768),
      startWith(window.innerWidth < 768),
    ),
    { initialValue: window.innerWidth < 768 },
  );

  protected readonly participants = signal<Participant[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly displayDialog = signal(false);
  protected readonly isEdit = signal(false);
  protected currentId: number | null = null;

  protected readonly participantForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    dateOfBirth: [null as Date | null, Validators.required],
  });

  ngOnInit(): void {
    this.loadParticipants();
  }

  private async loadParticipants(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.participantService.getAll());
      this.participants.set(data);
    } catch (err) {
      console.error('Failed to load participants', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Teilnehmer konnten nicht geladen werden.',
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected openAddDialog(): void {
    this.isEdit.set(false);
    this.currentId = null;
    this.participantForm.reset();
    this.displayDialog.set(true);
  }

  protected openEditDialog(participant: Participant): void {
    this.isEdit.set(true);
    this.currentId = participant.id;
    this.participantForm.patchValue({
      firstname: participant.firstname,
      lastname: participant.lastname,
      dateOfBirth: new Date(participant.dateOfBirth),
    });
    this.displayDialog.set(true);
  }

  protected closeDialog(): void {
    this.displayDialog.set(false);
    this.participantForm.reset();
  }

  protected async saveParticipant(): Promise<void> {
    if (this.participantForm.invalid) return;

    this.saving.set(true);
    const formValue = this.participantForm.getRawValue();

    const input: ParticipantInput = {
      firstname: formValue.firstname!,
      lastname: formValue.lastname!,
      dateOfBirth: this.formatDate(formValue.dateOfBirth!),
    };

    try {
      if (this.isEdit() && this.currentId) {
        await firstValueFrom(this.participantService.update(this.currentId, input));
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Teilnehmer aktualisiert.',
        });
      } else {
        await firstValueFrom(this.participantService.create(input));
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Teilnehmer erstellt.',
        });
      }
      this.closeDialog();
      await this.loadParticipants();
    } catch (err) {
      console.error('Failed to save participant', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Teilnehmer konnte nicht gespeichert werden.',
      });
    } finally {
      this.saving.set(false);
    }
  }

  protected confirmDelete(participant: Participant): void {
    this.confirmationService.confirm({
      message: `Möchten Sie ${participant.firstname} ${participant.lastname} wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await firstValueFrom(this.participantService.delete(participant.id));
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Teilnehmer gelöscht.',
          });
          await this.loadParticipants();
        } catch (err) {
          console.error('Failed to delete participant', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Teilnehmer konnte nicht gelöscht werden.',
          });
        }
      },
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
