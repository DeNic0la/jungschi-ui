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
import { Message } from 'primeng/message';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../shared/services/user.service';
import { ParticipantService } from '../../shared/services/participant.service';
import { Gender, Participant, ParticipantInput } from '../../shared/models/participant.model';
import { firstValueFrom, fromEvent, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Card } from 'primeng/card';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
    Message,
    ConfirmDialog,
    Card,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <p-toast />
      <p-confirmdialog />

      <header
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          {{ 'features.participants.title' | translate }}
        </h1>
        <p-button
          [label]="'features.participants.actions.new' | translate"
          icon="pi pi-plus"
          (click)="openAddDialog()"
          class="w-full sm:w-auto"
        />
      </header>

      @if (userProfile() && !userProfile()?.phoneNumber) {
        <p-message severity="warn" class="block mb-6" icon="pi pi-exclamation-triangle">
          {{ 'features.participants.phoneMissingBanner.beforeProfile' | translate }}
          <a routerLink="/profile" class="underline font-bold">
            {{ 'features.profile.title' | translate }}
          </a>
          {{ 'features.participants.phoneMissingBanner.afterProfile' | translate }}
        </p-message>
      }

      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (participant of participants(); track participant.id) {
            <p-card class="hover:shadow-lg transition-shadow cursor-pointer">
              <ng-template #header>
                <div
                  [routerLink]="['/participants', participant.id]"
                  class="px-6 pt-6 pb-2 border-b border-surface-200 dark:border-surface-700"
                >
                  <span class="text-xl font-bold text-primary block">
                    {{ participant.firstname }} {{ participant.lastname }}
                  </span>
                </div>
              </ng-template>

              <div class="flex flex-col gap-3 m-4">
                <div class="flex justify-between text-sm">
                  <span class="text-surface-500 dark:text-surface-400">
                    {{ 'features.participants.card.dateOfBirth' | translate }}
                  </span>
                  <span class="text-surface-900 dark:text-surface-0 font-medium">
                    {{ participant.dateOfBirth | date: 'dd.MM.yyyy' }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-surface-500 dark:text-surface-400">
                    {{ 'common.fields.gender' | translate }}
                  </span>
                  <span class="text-surface-900 dark:text-surface-0 font-medium">
                    {{ 'common.gender.' + participant.gender | translate }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-surface-500 dark:text-surface-400">
                    {{ 'features.participants.card.lastUpdated' | translate }}
                  </span>
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
                    [attr.aria-label]="'common.actions.view' | translate"
                  />
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    severity="secondary"
                    (click)="openEditDialog(participant)"
                    [attr.aria-label]="'common.actions.edit' | translate"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    severity="danger"
                    (click)="confirmDelete(participant)"
                    [attr.aria-label]="'common.actions.delete' | translate"
                  />
                </div>
              </div>
            </p-card>
          } @empty {
            <div class="col-span-full text-center py-20 text-surface-500 italic">
              {{ 'features.participants.empty' | translate }}
            </div>
          }
        </div>
      }

      <p-dialog
        [header]="
          (isEdit()
            ? 'features.participants.dialog.editTitle'
            : 'features.participants.dialog.createTitle'
          ) | translate
        "
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
            <label for="firstname" class="font-semibold text-sm">
              {{ 'common.fields.firstName' | translate }}
            </label>
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
              <small class="text-red-500 text-xs">
                {{
                  'common.validation.requiredField'
                    | translate: { field: ('common.fields.firstName' | translate) }
                }}
              </small>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label for="lastname" class="font-semibold text-sm">
              {{ 'common.fields.lastName' | translate }}
            </label>
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
              <small class="text-red-500 text-xs">
                {{
                  'common.validation.requiredField'
                    | translate: { field: ('common.fields.lastName' | translate) }
                }}
              </small>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label for="gender" class="font-semibold text-sm">
              {{ 'common.fields.gender' | translate }}
            </label>
            <select id="gender" formControlName="gender" class="p-inputtext p-component w-full">
              <option [ngValue]="null" disabled>{{ 'common.actions.select' | translate }}</option>
              <option value="male">{{ 'common.gender.male' | translate }}</option>
              <option value="female">{{ 'common.gender.female' | translate }}</option>
              <option value="else">{{ 'common.gender.else' | translate }}</option>
            </select>
            @if (participantForm.get('gender')?.invalid && participantForm.get('gender')?.touched) {
              <small class="text-red-500 text-xs">
                {{
                  'common.validation.requiredField'
                    | translate: { field: ('common.fields.gender' | translate) }
                }}
              </small>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label for="dateOfBirthInput" class="font-semibold text-sm">
              {{ 'common.fields.dateOfBirth' | translate }}
            </label>
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
              <small class="text-red-500 text-xs">
                {{
                  'common.validation.requiredField'
                    | translate: { field: ('common.fields.dateOfBirth' | translate) }
                }}
              </small>
            }
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <p-button
              [label]="'common.actions.cancel' | translate"
              severity="secondary"
              type="button"
              (click)="closeDialog()"
            />
            <p-button
              [label]="'common.actions.save' | translate"
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
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);

  protected readonly participants = signal<Participant[]>([]);
  protected readonly userProfile = this.userService.userProfile;
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly displayDialog = signal(false);
  protected readonly isEdit = signal(false);
  protected currentId: number | null = null;

  protected readonly isMobile = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth < 768),
      startWith(window.innerWidth < 768),
    ),
  );

  protected readonly participantForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    gender: [null as Gender | null, Validators.required],
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
        summary: this.t('common.status.error'),
        detail: this.t('features.participants.messages.loadError'),
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected openAddDialog(): void {
    if (!this.userProfile()?.phoneNumber) {
      this.messageService.add({
        severity: 'warn',
        summary: this.t('features.participants.messages.phoneMissingSummary'),
        detail: this.t('features.participants.messages.phoneMissingDetail'),
        life: 10000,
      });
      return;
    }
    this.isEdit.set(false);
    this.currentId = null;
    this.participantForm.reset();
    this.participantForm.patchValue({ gender: null });
    this.displayDialog.set(true);
  }

  protected openEditDialog(participant: Participant): void {
    this.isEdit.set(true);
    this.currentId = participant.id;
    this.participantForm.patchValue({
      firstname: participant.firstname,
      lastname: participant.lastname,
      gender: participant.gender,
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
      gender: formValue.gender!,
      dateOfBirth: this.formatDate(formValue.dateOfBirth!),
    };

    try {
      if (this.isEdit() && this.currentId) {
        await firstValueFrom(this.participantService.update(this.currentId, input));
        this.messageService.add({
          severity: 'success',
          summary: this.t('common.status.success'),
          detail: this.t('features.participants.messages.updated'),
        });
      } else {
        await firstValueFrom(this.participantService.create(input));
        this.messageService.add({
          severity: 'success',
          summary: this.t('common.status.success'),
          detail: this.t('features.participants.messages.created'),
        });
      }
      this.closeDialog();
      await this.loadParticipants();
    } catch (err) {
      console.error('Failed to save participant', err);
      this.messageService.add({
        severity: 'error',
        summary: this.t('common.status.error'),
        detail: this.t('features.participants.messages.saveError'),
      });
    } finally {
      this.saving.set(false);
    }
  }

  protected confirmDelete(participant: Participant): void {
    this.confirmationService.confirm({
      message: this.t('features.participants.confirmDelete.message', {
        firstName: participant.firstname,
        lastName: participant.lastname,
      }),
      header: this.t('features.participants.confirmDelete.header'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t('common.actions.delete'),
      rejectLabel: this.t('common.actions.cancel'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await firstValueFrom(this.participantService.delete(participant.id));
          this.messageService.add({
            severity: 'success',
            summary: this.t('common.status.success'),
            detail: this.t('features.participants.messages.deleted'),
          });
          await this.loadParticipants();
        } catch (err) {
          console.error('Failed to delete participant', err);
          this.messageService.add({
            severity: 'error',
            summary: this.t('common.status.error'),
            detail: this.t('features.participants.messages.deleteError'),
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

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
