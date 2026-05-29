import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CampDto, CampInput } from '../../shared/models/camp.model';
import { SignupState } from '../../shared/models/signup.model';
import { CampService } from '../../shared/services/camp.service';

@Component({
  selector: 'app-camp-management',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Button,
    Card,
    InputText,
    Message,
    TextareaModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <header class="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          {{ 'features.team.campManagement.title' | translate }}
        </h1>
        <p-button
          [label]="'common.actions.back' | translate"
          icon="pi pi-arrow-left"
          routerLink="/team"
          severity="secondary"
        />
      </header>

      @if (loadError()) {
        <p-message
          severity="error"
          [text]="'features.team.campManagement.messages.loadError' | translate"
        />
      }

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] gap-6">
        <p-card [header]="formTitle() | translate">
          <form class="grid grid-cols-1 gap-4" (ngSubmit)="saveCamp()">
            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.campManagement.fields.id' | translate }}
              <input
                pInputText
                [(ngModel)]="draft.id"
                name="id"
                required
                [disabled]="editingCampId() !== null"
              />
            </label>

            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.campManagement.fields.title' | translate }}
              <input pInputText [(ngModel)]="draft.title" name="title" required />
            </label>

            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.campManagement.fields.description' | translate }}
              <textarea
                pTextarea
                rows="4"
                [autoResize]="true"
                [(ngModel)]="draft.description"
                name="description"
              ></textarea>
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label class="flex flex-col gap-2 font-semibold">
                {{ 'features.team.campManagement.fields.startDate' | translate }}
                <input
                  pInputText
                  type="date"
                  [(ngModel)]="draft.startDate"
                  name="startDate"
                />
              </label>
              <label class="flex flex-col gap-2 font-semibold">
                {{ 'features.team.campManagement.fields.endDate' | translate }}
                <input pInputText type="date" [(ngModel)]="draft.endDate" name="endDate" />
              </label>
              <label class="flex flex-col gap-2 font-semibold">
                {{ 'features.team.campManagement.fields.signupEndDate' | translate }}
                <input
                  pInputText
                  type="date"
                  [(ngModel)]="draft.signupEndDate"
                  name="signupEndDate"
                />
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label class="flex flex-col gap-2 font-semibold">
                {{ 'features.team.campManagement.fields.priceFirst' | translate }}
                <input
                  pInputText
                  type="number"
                  min="0"
                  step="0.05"
                  [ngModel]="draft.priceFirst"
                  name="priceFirst"
                  (ngModelChange)="draft.priceFirst = numberOrNull($event)"
                />
              </label>
              <label class="flex flex-col gap-2 font-semibold">
                {{ 'features.team.campManagement.fields.priceSecond' | translate }}
                <input
                  pInputText
                  type="number"
                  min="0"
                  step="0.05"
                  [ngModel]="draft.priceSecond"
                  name="priceSecond"
                  (ngModelChange)="draft.priceSecond = numberOrNull($event)"
                />
              </label>
              <label class="flex flex-col gap-2 font-semibold">
                {{ 'features.team.campManagement.fields.priceThird' | translate }}
                <input
                  pInputText
                  type="number"
                  min="0"
                  step="0.05"
                  [ngModel]="draft.priceThird"
                  name="priceThird"
                  (ngModelChange)="draft.priceThird = numberOrNull($event)"
                />
              </label>
            </div>

            <label class="flex items-center gap-3 font-semibold">
              <input
                type="checkbox"
                class="h-4 w-4"
                [(ngModel)]="draft.isJugendUndSport"
                name="isJugendUndSport"
              />
              {{ 'features.team.campManagement.fields.isJugendUndSport' | translate }}
            </label>

            <div class="flex flex-col sm:flex-row gap-2">
              <p-button
                type="submit"
                [label]="'common.actions.save' | translate"
                icon="pi pi-save"
                [disabled]="saving() || !draft.id.trim() || !draft.title.trim()"
              />
              <p-button
                type="button"
                [label]="'common.actions.cancel' | translate"
                icon="pi pi-times"
                severity="secondary"
                (click)="resetDraft()"
              />
            </div>
          </form>
        </p-card>

        <div class="flex flex-col gap-4 min-w-0">
          @if (deleteCandidate(); as camp) {
            <p-card [header]="'features.team.campManagement.delete.title' | translate">
              <div class="flex flex-col gap-4">
                <p class="m-0 text-sm text-surface-600 dark:text-surface-300">
                  {{
                    'features.team.campManagement.delete.description'
                      | translate: { title: camp.title }
                  }}
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  @for (state of signupStates; track state) {
                    <label class="flex flex-col gap-2 font-semibold min-w-0">
                      {{ 'features.signup.states.' + state | translate }}
                      <textarea
                        pTextarea
                        rows="3"
                        [autoResize]="true"
                        [ngModel]="bulkFeedback[state]"
                        name="bulkFeedback-{{ state }}"
                        (ngModelChange)="bulkFeedback[state] = $event"
                      ></textarea>
                    </label>
                  }
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-2">
                  <p-button
                    [label]="'common.actions.cancel' | translate"
                    icon="pi pi-times"
                    severity="secondary"
                    (click)="deleteCandidate.set(null)"
                  />
                  <p-button
                    [label]="'features.team.campManagement.actions.deleteEndedCamp' | translate"
                    icon="pi pi-trash"
                    severity="danger"
                    (click)="confirmDelete(camp)"
                  />
                </div>
              </div>
            </p-card>
          }

          @for (camp of camps(); track camp.id) {
            <p-card>
              <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div class="min-w-0">
                  <h2 class="text-lg font-semibold m-0 truncate">{{ camp.title }}</h2>
                  <p class="text-sm text-surface-500 mt-1 mb-0">{{ camp.id }}</p>
                  <p class="text-sm text-surface-500 mt-1 mb-0">
                    {{ camp.startDate | date: 'dd.MM.yyyy' }} -
                    {{ camp.endDate | date: 'dd.MM.yyyy' }}
                  </p>
                  <p class="text-sm text-surface-500 mt-1 mb-0">
                    {{ 'features.team.campManagement.fields.signupEndDate' | translate }}:
                    {{ camp.signupEndDate | date: 'dd.MM.yyyy' }}
                  </p>
                </div>
                <div class="flex gap-2 shrink-0">
                  <p-button
                    icon="pi pi-pencil"
                    severity="secondary"
                    [attr.aria-label]="'common.actions.edit' | translate"
                    (click)="editCamp(camp)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [disabled]="!isEnded(camp)"
                    [attr.aria-label]="
                      'features.team.campManagement.actions.deleteEndedCamp' | translate
                    "
                    (click)="prepareDelete(camp)"
                  />
                </div>
              </div>
            </p-card>
          } @empty {
            <p-message severity="info" [text]="'features.team.campManagement.empty' | translate" />
          }
        </div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampManagementComponent {
  private readonly campService = inject(CampService);
  private readonly translate = inject(TranslateService);

  protected readonly camps = signal<CampDto[]>([]);
  protected readonly loadError = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingCampId = signal<string | null>(null);
  protected readonly deleteCandidate = signal<CampDto | null>(null);
  protected readonly signupStates: SignupState[] = ['IN_PROGRESS', 'COMPLETED', 'APPROVED'];
  protected draft: CampInput = this.emptyDraft();
  protected bulkFeedback: Record<SignupState, string> = {
    IN_PROGRESS: '',
    COMPLETED: '',
    APPROVED: '',
  };

  constructor() {
    this.loadCamps();
  }

  protected formTitle(): string {
    return this.editingCampId()
      ? 'features.team.campManagement.form.edit'
      : 'features.team.campManagement.form.create';
  }

  protected saveCamp(): void {
    const payload = this.normalizedDraft();
    if (!payload.id || !payload.title || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.loadError.set(false);
    const request = this.editingCampId()
      ? this.campService.update(this.editingCampId()!, payload)
      : this.campService.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetDraft();
        this.loadCamps();
      },
      error: () => {
        this.saving.set(false);
        this.loadError.set(true);
      },
    });
  }

  protected editCamp(camp: CampDto): void {
    this.editingCampId.set(camp.id);
    this.draft = {
      id: camp.id,
      title: camp.title,
      description: camp.description,
      startDate: camp.startDate,
      endDate: camp.endDate,
      signupEndDate: camp.signupEndDate,
      isJugendUndSport: camp.isJugendUndSport,
      priceFirst: camp.priceFirst,
      priceSecond: camp.priceSecond,
      priceThird: camp.priceThird,
    };
  }

  protected prepareDelete(camp: CampDto): void {
    this.deleteCandidate.set(camp);
    this.bulkFeedback = {
      IN_PROGRESS: '',
      COMPLETED: '',
      APPROVED: '',
    };
  }

  protected confirmDelete(camp: CampDto): void {
    if (!window.confirm(this.t('features.team.campManagement.delete.confirm'))) {
      return;
    }
    this.campService
      .delete(camp.id, {
        feedbackByState: {
          IN_PROGRESS: this.nullIfBlank(this.bulkFeedback.IN_PROGRESS),
          COMPLETED: this.nullIfBlank(this.bulkFeedback.COMPLETED),
          APPROVED: this.nullIfBlank(this.bulkFeedback.APPROVED),
        },
      })
      .subscribe({
        next: () => {
          this.deleteCandidate.set(null);
          this.loadCamps();
        },
        error: () => this.loadError.set(true),
      });
  }

  protected resetDraft(): void {
    this.editingCampId.set(null);
    this.draft = this.emptyDraft();
  }

  protected numberOrNull(value: string | number | null): number | null {
    if (value === null || value === '') {
      return null;
    }
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  protected isEnded(camp: CampDto): boolean {
    if (!camp.endDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${camp.endDate}T00:00:00`) < today;
  }

  private loadCamps(): void {
    this.campService.getAll().subscribe({
      next: (camps) => this.camps.set(camps),
      error: () => this.loadError.set(true),
    });
  }

  private normalizedDraft(): CampInput {
    return {
      ...this.draft,
      id: this.draft.id.trim(),
      title: this.draft.title.trim(),
      description: this.nullIfBlank(this.draft.description),
    };
  }

  private emptyDraft(): CampInput {
    return {
      id: '',
      title: '',
      description: null,
      startDate: null,
      endDate: null,
      signupEndDate: null,
      isJugendUndSport: false,
      priceFirst: null,
      priceSecond: null,
      priceThird: null,
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
