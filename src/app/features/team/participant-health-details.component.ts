import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe, DatePipe } from '@angular/common';
import { catchError, of, switchMap, tap } from 'rxjs';
import { TeamService } from '../../shared/services/team.service';
import { getSeverityColor } from '../../shared/models/intolerance-selection.model';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-participant-health-details',
  imports: [
    RouterLink,
    JsonPipe,
    DatePipe,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Card,
    Divider,
    Tag,
    Button,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <header
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          {{ 'features.team.healthDetails.title' | translate }}
        </h1>
        <p-button
          [label]="'features.participantDetail.actions.backToList' | translate"
          icon="pi pi-arrow-left"
          routerLink="/team/health-data"
          severity="secondary"
          class="w-full sm:w-auto"
        />
      </header>

      <div class="mt-4">
        @if (isLoading()) {
          <div class="flex justify-center items-center py-10 gap-2">
            <i class="pi pi-spin pi-spinner text-2xl text-primary" aria-hidden="true"></i>
            <span class="text-surface-600 dark:text-surface-400">
              {{ 'common.status.loadingData' | translate }}
            </span>
          </div>
        } @else if (error()) {
          <div
            class="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-4 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400"
          >
            <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
            <span>{{ error() }}</span>
          </div>
        } @else if (participant(); as p) {
          <p-tabs value="0">
            <p-tablist>
              <p-tab value="0">{{
                'features.team.healthDetails.tabs.structured' | translate
              }}</p-tab>
              <p-tab value="1">{{ 'features.team.healthDetails.tabs.rawJson' | translate }}</p-tab>
            </p-tablist>
            <p-tabpanels>
              <p-tabpanel value="0">
                <div class="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Basic Info -->
                  <p-card class="h-full">
                    <ng-template #header>
                      <div
                        class="p-5 font-bold text-lg border-b border-surface-200 dark:border-surface-700 flex items-center"
                      >
                        <i class="pi pi-user mr-3 text-primary"></i>
                        <span>{{
                          'features.team.healthDetails.sections.participantAccount' | translate
                        }}</span>
                      </div>
                    </ng-template>
                    <div class="flex flex-col gap-4 p-5">
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          {{ 'common.fields.name' | translate }}
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.firstname }} {{ p.lastname }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          {{ 'common.fields.dateOfBirth' | translate }}
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.dateOfBirth | date: 'dd.MM.yyyy' }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          {{ 'common.fields.lastUpdatedAt' | translate }}
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.lastUpdatedAt | date: 'dd.MM.yyyy HH:mm' }}
                        </div>
                      </div>
                      <p-divider />
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          {{ 'features.team.healthDetails.fields.account' | translate }}
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.user.firstName }} {{ p.user.lastName }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          {{ 'common.fields.email' | translate }}
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.user.email }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          {{ 'common.fields.phoneNumber' | translate }}
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.user.phoneNumber || '-' }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          {{ 'common.fields.address' | translate }}
                        </label>
                        <div
                          class="font-medium text-surface-900 dark:text-surface-0 whitespace-pre-wrap"
                        >
                          {{ p.user.address || '-' }}
                        </div>
                      </div>
                    </div>
                  </p-card>

                  <!-- Health Stats -->
                  <p-card class="h-full">
                    <ng-template #header>
                      <div
                        class="p-5 font-bold text-lg border-b border-surface-200 dark:border-surface-700 flex items-center"
                      >
                        <i class="pi pi-heart mr-3 text-primary"></i>
                        <span>{{
                          'features.team.healthDetails.sections.healthStatus' | translate
                        }}</span>
                      </div>
                    </ng-template>
                    <div class="flex flex-col gap-4 p-5">
                      @if (p.healthStats; as hs) {
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{ 'features.team.healthDetails.fields.healthy' | translate }}
                          </label>
                          <div>
                            <p-tag
                              [severity]="hs.isHealthy ? 'success' : 'danger'"
                              [value]="
                                hs.isHealthy
                                  ? ('common.boolean.yes' | translate)
                                  : ('common.boolean.no' | translate)
                              "
                            />
                          </div>
                        </div>
                        @if (!hs.isHealthy) {
                          <div class="flex flex-col gap-1">
                            <label
                              class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                            >
                              {{ 'features.team.healthDetails.fields.reason' | translate }}
                            </label>
                            <div class="font-medium text-surface-900 dark:text-surface-0">
                              {{ hs.healthyReason }}
                            </div>
                          </div>
                        }
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{
                              'features.team.healthDetails.fields.excludedActivities' | translate
                            }}
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0">
                            {{ hs.excludedActivities || ('common.empty.none' | translate) }}
                          </div>
                        </div>
                      } @else {
                        <p class="italic text-surface-500">
                          {{ 'common.empty.noData' | translate }}
                        </p>
                      }
                    </div>
                  </p-card>

                  <!-- Camp Stats -->
                  <p-card class="h-full">
                    <ng-template #header>
                      <div
                        class="p-5 font-bold text-lg border-b border-surface-200 dark:border-surface-700 flex items-center"
                      >
                        <i class="pi pi-map mr-3 text-primary"></i>
                        <span>{{
                          'features.team.healthDetails.sections.campInfo' | translate
                        }}</span>
                      </div>
                    </ng-template>
                    <div class="flex flex-col gap-4 p-5">
                      @if (p.campStats; as cs) {
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{ 'features.team.healthDetails.fields.tickVaccination' | translate }}
                          </label>
                          <div>
                            <p-tag
                              [severity]="cs.isTickVaccinated ? 'success' : 'secondary'"
                              [value]="
                                cs.isTickVaccinated
                                  ? ('common.boolean.yes' | translate)
                                  : ('common.boolean.no' | translate)
                              "
                            />
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{ 'features.team.healthDetails.fields.drugConsent' | translate }}
                          </label>
                          <div>
                            <p-tag
                              [severity]="cs.drugConsent ? 'success' : 'secondary'"
                              [value]="
                                cs.drugConsent
                                  ? ('common.boolean.yes' | translate)
                                  : ('common.boolean.no' | translate)
                              "
                            />
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{ 'features.participantDetail.campStats.form.ahv.label' | translate }}
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0">
                            {{ cs.ahv || '-' }}
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{
                              'features.participantDetail.campStats.form.krankenkasse.label'
                                | translate
                            }}
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0">
                            {{ cs.krankenkasse || '-' }}
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{
                              'features.participantDetail.campStats.form.krankenkassenNr.label'
                                | translate
                            }}
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0">
                            {{ cs.krankenkassenNr || '-' }}
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{
                              'features.participantDetail.campStats.form.medication.label'
                                | translate
                            }}
                          </label>
                          <div
                            class="font-medium text-surface-900 dark:text-surface-0 text-sm whitespace-pre-wrap"
                          >
                            {{ cs.medication || ('common.empty.none' | translate) }}
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            {{ 'features.team.healthDetails.fields.remarks' | translate }}
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0 text-sm">
                            {{ cs.notes || ('common.empty.none' | translate) }}
                          </div>
                        </div>
                      } @else {
                        <p class="italic text-surface-500">
                          {{ 'common.empty.noData' | translate }}
                        </p>
                      }
                    </div>
                  </p-card>

                  <!-- Intolerances -->
                  <p-card class="md:col-span-2">
                    <ng-template #header>
                      <div
                        class="p-5 font-bold text-lg border-b border-surface-200 dark:border-surface-700 flex items-center"
                      >
                        <i class="pi pi-exclamation-circle mr-3 text-primary"></i>
                        <span>{{
                          'features.team.healthDetails.sections.allergies' | translate
                        }}</span>
                      </div>
                    </ng-template>
                    <div class="p-5">
                      @if (p.intoleranceSelections.length === 0) {
                        <p class="italic text-surface-500">
                          {{ 'common.empty.noEntries' | translate }}
                        </p>
                      } @else {
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          @for (item of p.intoleranceSelections; track item.id) {
                            <div
                              class="p-4 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg"
                            >
                              <div class="flex justify-between items-center mb-2">
                                <span class="font-bold text-surface-900 dark:text-surface-0">
                                  {{ item.intolerance.definitionValue }}
                                </span>
                                <p-tag
                                  [severity]="getSeverityColor(item.severity)"
                                  [value]="getSeverityKey(item.severity) | translate"
                                />
                              </div>
                              @if (item.customText) {
                                <div class="text-sm text-surface-600 dark:text-surface-400 italic">
                                  {{ item.customText }}
                                </div>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </p-card>
                </div>
              </p-tabpanel>
              <p-tabpanel value="1">
                <pre
                  class="bg-surface-900 text-surface-0 p-6 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed shadow-inner"
                  >{{ p | json }}</pre
                >
              </p-tabpanel>
            </p-tabpanels>
          </p-tabs>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantHealthDetailsComponent {
  private readonly teamService = inject(TeamService);
  private readonly translate = inject(TranslateService);
  id = input.required<string>();

  error = signal<string | null>(null);
  isLoading = signal(false);

  participant = toSignal(
    toObservable(this.id).pipe(
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap((id) =>
        this.teamService.getParticipant(id).pipe(
          tap(() => this.isLoading.set(false)),
          catchError((err) => {
            console.error('Failed to load participant data:', err);
            this.isLoading.set(false);
            this.error.set(
              this.translate.instant('features.team.healthDetails.messages.loadError'),
            );
            return of(null);
          }),
        ),
      ),
    ),
  );

  protected readonly getSeverityColor = getSeverityColor;

  protected getSeverityKey(severity: string | null): string {
    switch (severity) {
      case 'LIFE_THREATENING':
        return 'common.severity.lifeThreatening';
      case 'STRONG':
        return 'common.severity.strong';
      case 'AFFECTED':
        return 'common.severity.affected';
      default:
        return 'common.status.unknown';
    }
  }
}
