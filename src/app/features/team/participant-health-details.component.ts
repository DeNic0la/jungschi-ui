import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe, DatePipe } from '@angular/common';
import { catchError, of, switchMap, tap } from 'rxjs';
import { TeamService } from '../../shared/services/team.service';
import { getSeverityColor, getSeverityLabel } from '../../shared/models/intolerance-selection.model';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

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
  ],
  template: `
    <div class="page-container">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Gesundheitsdetails</h1>
        <p-button
          label="Zurück zur Liste"
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
            <span class="text-surface-600 dark:text-surface-400">Lade Daten...</span>
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
              <p-tab value="0">Strukturiert</p-tab>
              <p-tab value="1">Raw JSON</p-tab>
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
                        <span>Teilnehmer & Account</span>
                      </div>
                    </ng-template>
                    <div class="flex flex-col gap-4 p-5">
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          Name
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.firstname }} {{ p.lastname }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          Geburtsdatum
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.dateOfBirth | date: 'dd.MM.yyyy' }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          Letztes Update
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
                          Account
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.user.firstName }} {{ p.user.lastName }}
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                        >
                          E-Mail
                        </label>
                        <div class="font-medium text-surface-900 dark:text-surface-0">
                          {{ p.user.email }}
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
                        <span>Gesundheitsstatus</span>
                      </div>
                    </ng-template>
                    <div class="flex flex-col gap-4 p-5">
                      @if (p.healthStats; as hs) {
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            Gesund
                          </label>
                          <div>
                            <p-tag
                              [severity]="hs.isHealthy ? 'success' : 'danger'"
                              [value]="hs.isHealthy ? 'Ja' : 'Nein'"
                            />
                          </div>
                        </div>
                        @if (!hs.isHealthy) {
                          <div class="flex flex-col gap-1">
                            <label
                              class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                            >
                              Grund
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
                            Eingeschränkte Aktivitäten
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0">
                            {{ hs.excludedActivities || 'Keine' }}
                          </div>
                        </div>
                      } @else {
                        <p class="italic text-surface-500">Keine Daten vorhanden.</p>
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
                        <span>Lager-Informationen</span>
                      </div>
                    </ng-template>
                    <div class="flex flex-col gap-4 p-5">
                      @if (p.campStats; as cs) {
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            Zeckenimpfung
                          </label>
                          <div>
                            <p-tag
                              [severity]="cs.isTickVaccinated ? 'success' : 'secondary'"
                              [value]="cs.isTickVaccinated ? 'Ja' : 'Nein'"
                            />
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            Medikamentenabgabe
                          </label>
                          <div>
                            <p-tag
                              [severity]="cs.drugConsent ? 'success' : 'secondary'"
                              [value]="cs.drugConsent ? 'Ja' : 'Nein'"
                            />
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            AHV-Nummer
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0">
                            {{ cs.ahv || '-' }}
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            Krankenkasse
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0">
                            {{ cs.krankenkasse || '-' }}
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <label
                            class="text-xs uppercase tracking-wider text-surface-500 font-semibold"
                          >
                            Bemerkungen
                          </label>
                          <div class="font-medium text-surface-900 dark:text-surface-0 text-sm">
                            {{ cs.notes || 'Keine' }}
                          </div>
                        </div>
                      } @else {
                        <p class="italic text-surface-500">Keine Daten vorhanden.</p>
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
                        <span>Allergien & Unverträglichkeiten</span>
                      </div>
                    </ng-template>
                    <div class="p-5">
                      @if (p.intoleranceSelections.length === 0) {
                        <p class="italic text-surface-500">Keine Einträge vorhanden.</p>
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
                                  [value]="getSeverityLabel(item.severity)"
                                />
                              </div>
                              @if (item.customText) {
                                <div
                                  class="text-sm text-surface-600 dark:text-surface-400 italic"
                                >
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
            this.error.set('Fehler beim Laden der Teilnehmerdaten.');
            return of(null);
          }),
        ),
      ),
    ),
  );

  protected readonly getSeverityColor = getSeverityColor;
  protected readonly getSeverityLabel = getSeverityLabel;
}
