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
import {StyleClass} from 'primeng/styleclass';

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

      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Teilnehmer</h1>
        <p-button
          label="Neuer Teilnehmer"
          icon="pi pi-plus"
          (click)="openAddDialog()"
          class="w-full sm:w-auto"
        />
      </header>

      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (participant of participants(); track participant.id) {
            <p-card
              class="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <ng-template #header>
                <div
                  [routerLink]="['/participants', participant.id]"
                  class="px-6 pt-6 pb-2 border-b border-surface-200 dark:border-surface-700">
                  <span class="text-xl font-bold text-primary block">
                    {{ participant.firstname }} {{ participant.lastname }}
                  </span>
                </div>
              </ng-template>

              <div class="flex flex-col gap-3 m-4">
                <div class="flex justify-between text-sm">
                  <span class="text-surface-500 dark:text-surface-400">Geburtsdatum:</span>
                  <span class="text-surface-900 dark:text-surface-0 font-medium">
                    {{ participant.dateOfBirth | date: 'dd.MM.yyyy' }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-surface-500 dark:text-surface-400">Zuletzt aktualisiert:</span>
                  <span class="text-surface-900 dark:text-surface-0 font-medium">
                    {{ participant.lastUpdatedAt | date: 'dd.MM.yyyy HH:mm' }}
                  </span>
                </div>
                <div class="flex justify-around">
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
              </div>


            </p-card>
          } @empty {
            <div class="col-span-full text-center py-20 text-surface-500 italic">
              Keine Teilnehmer gefunden.
            </div>
          }
        </div>
      }

      <p-dialog
        [header]="isEdit() ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'"
        [(visible)]="displayDialog"
        [modal]="true"
        [breakpoints]="{ '960px': '75vw', '640px': '90vw' }"
        [style]="{ width: '50vw' }"
        (onHide)="closeDialog()"
      >
        <form
          [formGroup]="participantForm"
          (ngSubmit)="saveParticipant()"
          class="flex flex-col gap-5 pt-4"
        >
          <div class="flex flex-col gap-2">
            <label for="firstname" class="font-semibold text-sm">Vorname</label>
            <input
              pInputText
              id="firstname"
              formControlName="firstname"
              autocomplete="given-name"
              class="w-full"
            />
            @if (
              participantForm.get('firstname')?.invalid && participantForm.get('firstname')?.touched
            ) {
              <small class="text-red-500 text-xs">Vorname ist erforderlich.</small>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label for="lastname" class="font-semibold text-sm">Nachname</label>
            <input
              pInputText
              id="lastname"
              formControlName="lastname"
              autocomplete="family-name"
              class="w-full"
            />
            @if (
              participantForm.get('lastname')?.invalid && participantForm.get('lastname')?.touched
            ) {
              <small class="text-red-500 text-xs">Nachname ist erforderlich.</small>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label for="dateOfBirthInput" class="font-semibold text-sm">Geburtsdatum</label>
            <p-datepicker
              id="dateOfBirth"
              formControlName="dateOfBirth"
              dateFormat="dd.mm.yy"
              appendTo="body"
              [showIcon]="true"
              inputId="dateOfBirthInput"
              styleClass="w-full"
            />
            @if (
              participantForm.get('dateOfBirth')?.invalid &&
              participantForm.get('dateOfBirth')?.touched
            ) {
              <small class="text-red-500 text-xs">Geburtsdatum ist erforderlich.</small>
            }
          </div>

          <div class="flex justify-end gap-3 mt-4">
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
