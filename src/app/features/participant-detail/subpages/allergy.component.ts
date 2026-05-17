import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
  untracked,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap, of, filter, forkJoin, catchError, Observable } from 'rxjs';

import { AutoComplete } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

import { GlobalDefinitionsService } from '../../../shared/services/global-definitions.service';
import { GlobalDefinitionDto } from '../../../shared/models/global-definition.model';
import { ParticipantService } from '../../../shared/services/participant.service';
import {
  IntoleranceSelectionDto,
  Severity,
  getSeverityColor,
  getSeverityCSSColor,
} from '../../../shared/models/intolerance-selection.model';
import { CanComponentDeactivate } from '../../../shared/guards/pending-changes.guard';
import { PrimeTemplate } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

interface IntoleranceItem {
  intoleranceId: number | null;
  label: string;
  definitionValue: string;
  severity: Severity | null;
  notes: string | null;
  isCustom: boolean;
}

@Component({
  selector: 'app-allergy',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AutoComplete,
    Button,
    TextareaModule,
    Message,
    Select,
    Card,
    Tag,
    PrimeTemplate,
    TranslatePipe,
  ],
  template: `
    <section>
      <h2>{{ 'features.participantDetail.allergy.title' | translate }}</h2>

      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner spinner-icon" aria-hidden="true"></i>
          <span class="sr-only">{{ 'common.status.loading' | translate }}</span>
        </div>
      } @else {
        <div class="content-container">
          <p-card class="add-section-card">
            <div class="card-header">
              <h3 class="m-0">
                <i class="pi pi-plus-circle mr-2"></i>
                {{ 'features.participantDetail.allergy.addSection.title' | translate }}
              </h3>
            </div>
            <div class="grid-layout mt-4">
              <div class="field">
                <label for="searchAllergies">
                  {{
                    'features.participantDetail.allergy.addSection.searchAllergies.label'
                      | translate
                  }}
                </label>
                <p-autocomplete
                  inputId="searchAllergies"
                  [formControl]="searchControl"
                  completeOnFocus="true"
                  minQueryLength="0"
                  [suggestions]="filteredAllergies()"
                  (completeMethod)="searchAllergies($event)"
                  (onSelect)="addAllergy($event)"
                  optionLabel="definitionValue"
                  [fluid]="true"
                  [placeholder]="
                    'features.participantDetail.allergy.addSection.searchAllergies.placeholder'
                      | translate
                  "
                  [ariaLabel]="
                    'features.participantDetail.allergy.addSection.searchAllergies.label'
                      | translate
                  "
                >
                </p-autocomplete>
              </div>

              <div class="field">
                <label for="searchFoodIntolerances">
                  {{
                    'features.participantDetail.allergy.addSection.searchFoodIntolerances.label'
                      | translate
                  }}
                </label>
                <p-autocomplete
                  inputId="searchFoodIntolerances"
                  [formControl]="searchControl"
                  minQueryLength="0"
                  completeOnFocus="true"
                  [suggestions]="filteredFoodIntolerances()"
                  (completeMethod)="searchFoodIntolerances($event)"
                  (onSelect)="addFoodIntolerance($event)"
                  optionLabel="definitionValue"
                  [fluid]="true"
                  [placeholder]="
                    'features.participantDetail.allergy.addSection.searchFoodIntolerances.placeholder'
                      | translate
                  "
                  [ariaLabel]="
                    'features.participantDetail.allergy.addSection.searchFoodIntolerances.label'
                      | translate
                  "
                />
              </div>
            </div>

            @if (!items().some((i) => i.intoleranceId === null)) {
              <div class="add-custom-container">
                <p-button
                  [label]="'features.participantDetail.allergy.actions.addCustom' | translate"
                  icon="pi pi-plus"
                  [text]="true"
                  (click)="addCustomItem()"
                  [ariaLabel]="
                    'features.participantDetail.allergy.actions.addCustomAria' | translate
                  "
                />
              </div>
            }
          </p-card>

          @if (items().length > 0) {
            <div class="selections-section">
              <div class="flex justify-between items-center mb-2">
                <h3 class="m-0">
                  {{ 'features.participantDetail.allergy.currentEntries.title' | translate }}
                </h3>
                <p-tag
                  [value]="
                    'features.participantDetail.allergy.currentEntries.count'
                      | translate: { count: items().length }
                  "
                  severity="secondary"
                />
              </div>

              @for (item of items(); track trackByIndex($index, item)) {
                <p-card
                  class="intolerance-card"
                  [class]="'severity-' + (item.severity?.toLowerCase() || 'none')"
                >
                  <div class="card-header">
                    <div class="flex items-center gap-3">
                      <i
                        class="pi pi-exclamation-triangle"
                        [style.color]="getSeverityCSSColor(item.severity)"
                      ></i>
                      <h4 class="m-0">
                        {{
                          item.isCustom
                            ? item.notes ||
                              ('features.participantDetail.allergy.customDefaultLabel' | translate)
                            : item.label
                        }}
                      </h4>
                      @if (item.isCustom) {
                        <p-tag
                          [value]="
                            'features.participantDetail.allergy.currentEntries.customTag'
                              | translate
                          "
                          severity="contrast"
                          [rounded]="true"
                        />
                      }
                    </div>
                    <p-button
                      icon="pi pi-trash"
                      severity="danger"
                      [text]="true"
                      [rounded]="true"
                      (click)="removeItem($index)"
                      [ariaLabel]="'common.actions.remove' | translate"
                    />
                  </div>

                  <div class="card-content">
                    <div class="field">
                      <label [for]="'severity-' + $index">
                        {{
                          'features.participantDetail.allergy.currentEntries.severity.label'
                            | translate
                        }}
                      </label>
                      <p-select
                        [inputId]="'severity-' + $index"
                        [options]="severityOptions"
                        [(ngModel)]="item.severity"
                        optionLabel="labelKey"
                        optionValue="value"
                        [placeholder]="
                          'features.participantDetail.allergy.currentEntries.severity.placeholder'
                            | translate
                        "
                        [fluid]="true"
                        (onChange)="markDirty()"
                      >
                        <ng-template pTemplate="selectedItem" let-selectedOption>
                          @if (selectedOption) {
                            <div class="flex items-center gap-2">
                              <p-tag
                                [severity]="getSeverityColor(selectedOption.value)"
                                [value]="selectedOption.labelKey | translate"
                              />
                            </div>
                          }
                        </ng-template>
                        <ng-template pTemplate="option" let-option>
                          <div class="flex items-center gap-2">
                            <p-tag
                              [severity]="getSeverityColor(option.value)"
                              [value]="option.labelKey | translate"
                            />
                          </div>
                        </ng-template>
                      </p-select>
                    </div>

                    <div class="field">
                      <label [for]="'notes-' + $index">
                        {{
                          'features.participantDetail.allergy.currentEntries.notes.label'
                            | translate
                        }}
                      </label>
                      <textarea
                        pTextarea
                        [id]="'notes-' + $index"
                        [(ngModel)]="item.notes"
                        (ngModelChange)="markDirty()"
                        [autoResize]="true"
                        rows="2"
                        [placeholder]="
                          'features.participantDetail.allergy.currentEntries.notes.placeholder'
                            | translate
                        "
                      ></textarea>
                    </div>
                  </div>
                </p-card>
              }
            </div>
          } @else {
            <div class="empty-state">
              <i class="pi pi-info-circle text-4xl mb-3 opacity-50"></i>
              <p>
                {{ 'features.participantDetail.allergy.empty' | translate }}
              </p>
            </div>
          }

          <div class="form-actions sticky-actions">
            <p-button
              [label]="'features.participantDetail.allergy.actions.saveChanges' | translate"
              type="button"
              (click)="save()"
              [loading]="saving()"
              icon="pi pi-save"
              [disabled]="!isDirty() || saving()"
              size="large"
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
        </div>
      }
    </section>
  `,
  styles: `
    section {
      padding: 1rem 0;
    }
    .content-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 900px;
      margin-top: 1rem;
    }
    .selections-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .intolerance-card {
      border-left: 6px solid var(--p-surface-500);
      transition: all 0.2s ease;
    }
    .severity-affected {
      border-left-color: var(--p-blue-900);
    }
    .severity-strong {
      border-left-color: var(--p-orange-900);
    }
    .severity-life_threatening {
      border-left-color: var(--p-red-900);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .card-header h4 {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--p-primary-color);
    }
    .card-content {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 1.5rem;
      align-items: start;
    }
    .add-section-card {
      border: 1px dashed var(--p-surface-300);
    }
    .grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .add-custom-container {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--p-surface-300);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .field label {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--p-secondary-text-color);
    }
    .form-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-top: 1rem;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .sticky-actions {
      position: sticky;
      bottom: 1rem;
      z-index: 100;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      border-radius: 12px;
      border: 2px dashed var(--p-surface-200);
      color: var(--block-text-color);
    }
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem 0;
    }
    .spinner-icon {
      font-size: 3rem;
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

    @media (max-width: 768px) {
      .card-content {
        grid-template-columns: 1fr;
      }
      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllergyComponent implements CanComponentDeactivate {
  private readonly globalDefinitionsService = inject(GlobalDefinitionsService);
  private readonly participantService = inject(ParticipantService);
  private readonly translate = inject(TranslateService);

  // Participant ID from route (via withComponentInputBinding)
  id = input.required<string>();

  protected readonly numericId = computed(() => {
    const val = this.id();
    return val ? Number(val) : null;
  });

  // Available options from API
  private readonly allAllergies = toSignal(this.globalDefinitionsService.getAllergies(), {
    initialValue: [],
  });
  private readonly allFoodIntolerances = toSignal(
    this.globalDefinitionsService.getFoodIntolerances(),
    { initialValue: [] },
  );

  // Initial Selections from API for this participant
  private readonly refreshTrigger = signal<number>(0);
  protected readonly initialSelections = toSignal(
    toObservable(this.numericId).pipe(
      filter((id) => !!id),
      switchMap((id) => {
        this.refreshTrigger(); // Added dependency for refresh
        return this.participantService.getIntoleranceSelections(id!).pipe(catchError(() => of([])));
      }),
    ),
  );

  // Current items list
  protected readonly items = signal<IntoleranceItem[]>([]);
  private readonly initialItemsJson = signal<string>('[]');

  // Filtered options for autocompletes
  protected readonly filteredAllergies = signal<GlobalDefinitionDto[]>([]);
  protected readonly filteredFoodIntolerances = signal<GlobalDefinitionDto[]>([]);

  // Search control
  protected readonly searchControl = new FormControl<GlobalDefinitionDto | null>(null);

  // Severity options
  protected readonly severityOptions = [
    { labelKey: 'common.severity.affected', value: 'AFFECTED' as Severity },
    { labelKey: 'common.severity.strong', value: 'STRONG' as Severity },
    { labelKey: 'common.severity.lifeThreatening', value: 'LIFE_THREATENING' as Severity },
  ];

  // Status signals
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal<string | null>(null);
  private readonly dirty = signal(false);

  loading = computed(() => this.initialSelections() === undefined);

  protected readonly getSeverityColor = getSeverityColor;
  protected readonly getSeverityCSSColor = getSeverityCSSColor;

  constructor() {
    effect(() => {
      const selections = this.initialSelections();
      const allA = this.allAllergies();
      const allFI = this.allFoodIntolerances();

      // Ensure selections and global definitions are loaded
      if (selections !== undefined && selections.length >= 0) {
        untracked(() => {
          const itemsList: IntoleranceItem[] = selections.map((sel) => {
            const allergyDef = allA.find((a) => a.id === sel.intoleranceId);
            const foodDef = allFI.find((fi) => fi.id === sel.intoleranceId);
            const definition = allergyDef || foodDef;

            return {
              intoleranceId: sel.intoleranceId,
              definitionValue: definition?.definitionValue ?? this.t('common.status.unknown'),
              label: definition?.label ?? sel.customText ?? this.t('common.status.unknown'),
              severity: sel.severity,
              notes: sel.customText,
              isCustom: !definition,
            };
          });

          this.items.set(itemsList);
          this.initialItemsJson.set(JSON.stringify(itemsList));
          this.dirty.set(false);
        });
      }
    });
  }

  searchAllergies(event: { query: string }) {
    const query = event.query.toLowerCase();
    const currentIds = this.items().map((i) => i.intoleranceId);
    this.filteredAllergies.set(
      this.allAllergies().filter(
        (a) => a.label.toLowerCase().includes(query) && !currentIds.includes(a.id),
      ),
    );
  }

  searchFoodIntolerances(event: { query: string }) {
    const query = event.query.toLowerCase();
    const currentIds = this.items().map((i) => i.intoleranceId);
    this.filteredFoodIntolerances.set(
      this.allFoodIntolerances().filter(
        (f) => f.label.toLowerCase().includes(query) && !currentIds.includes(f.id),
      ),
    );
  }

  addAllergy(event: { value: GlobalDefinitionDto }) {
    const item = event.value;
    this.items.update((items) => [
      ...items,
      {
        intoleranceId: item.id,
        label: item.label,
        definitionValue: item.definitionValue,
        severity: null,
        notes: null,
        isCustom: false,
      },
    ]);
    this.searchControl.reset();
    this.markDirty();
  }

  addFoodIntolerance(event: { value: GlobalDefinitionDto }) {
    const item = event.value;
    this.items.update((items) => [
      ...items,
      {
        intoleranceId: item.id,
        label: item.label,
        definitionValue: item.definitionValue,
        severity: null,
        notes: null,
        isCustom: false,
      },
    ]);
    this.searchControl.reset();
    this.markDirty();
  }

  addCustomItem() {
    if (this.items().some((i) => i.intoleranceId === null)) {
      return;
    }
    this.items.update((items) => [
      ...items,
      {
        intoleranceId: null,
        label: '',
        definitionValue: 'CUSTOM',
        severity: null,
        notes: '',
        isCustom: true,
      },
    ]);
    this.markDirty();
  }

  removeItem(index: number) {
    this.items.update((items) => items.filter((_, i) => i !== index));
    this.markDirty();
  }

  trackByIndex(index: number, item: IntoleranceItem): number {
    return index;
  }

  markDirty() {
    this.dirty.set(true);
  }

  isDirty(): boolean {
    return this.dirty();
  }

  save() {
    const participantId = this.numericId();
    if (!participantId) return;

    this.saving.set(true);
    this.error.set(null);

    const currentItems = this.items();
    const requests: Observable<IntoleranceSelectionDto | void>[] = [];

    // Update or create all current items
    currentItems.forEach((item) => {
      requests.push(
        this.participantService.updateIntoleranceSelection(participantId, {
          intoleranceId: item.intoleranceId,
          customText: item.notes,
          severity: item.severity,
        }),
      );
    });

    // Delete items that were removed
    const initial = this.initialSelections() || [];
    const currentIds = currentItems.map((i) => i.intoleranceId);
    const toDelete = initial.filter((s) => !currentIds.includes(s.intoleranceId));

    toDelete.forEach((sel) => {
      if (sel.intoleranceId !== null) {
        requests.push(
          this.participantService.deleteIntoleranceSelection(participantId, sel.intoleranceId),
        );
      } else {
        requests.push(this.participantService.deleteIntoleranceSelection(participantId));
      }
    });

    if (requests.length === 0) {
      this.saving.set(false);
      this.dirty.set(false);
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.dirty.set(false);
        this.refreshTrigger.update((n) => n + 1);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(this.t('common.status.saveError'));
        console.error(err);
      },
    });
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
