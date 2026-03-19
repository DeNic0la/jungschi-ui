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
      <header class="flex-header">
        <h1>Gesundheitsdetails</h1>
        <p-button
          label="Zurück zur Liste"
          icon="pi pi-arrow-left"
          routerLink="/team/health-data"
          severity="secondary"
        />
      </header>

      <div class="content">
        @if (isLoading()) {
          <div class="loading-container">
            <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
            <span>Lade Daten...</span>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <div class="error-message">
              <i class="pi pi-exclamation-triangle mr-2" aria-hidden="true"></i>
              <span>{{ error() }}</span>
            </div>
          </div>
        } @else if (participant(); as p) {
          <p-tabs value="0">
            <p-tablist>
              <p-tab value="0">Strukturiert</p-tab>
              <p-tab value="1">Raw JSON</p-tab>
            </p-tablist>
            <p-tabpanels>
              <p-tabpanel value="0">
                <div class="structured-view">
                  <div class="grid-container">
                    <!-- Basic Info -->
                    <p-card class="info-card">
                      <ng-template #header>
                        <div class="card-header">
                          <i class="pi pi-user mr-2"></i>
                          <span>Teilnehmer & Account</span>
                        </div>
                      </ng-template>
                      <div class="info-grid">
                        <div class="info-item">
                          <label>Name</label>
                          <div class="value">{{ p.firstname }} {{ p.lastname }}</div>
                        </div>
                        <div class="info-item">
                          <label>Geburtsdatum</label>
                          <div class="value">{{ p.dateOfBirth | date: 'dd.MM.yyyy' }}</div>
                        </div>
                        <div class="info-item">
                          <label>Letztes Update</label>
                          <div class="value">{{ p.lastUpdatedAt | date: 'dd.MM.yyyy HH:mm' }}</div>
                        </div>
                        <p-divider />
                        <div class="info-item">
                          <label>Account</label>
                          <div class="value">{{ p.user.firstName }} {{ p.user.lastName }}</div>
                        </div>
                        <div class="info-item">
                          <label>E-Mail</label>
                          <div class="value">{{ p.user.email }}</div>
                        </div>
                      </div>
                    </p-card>

                    <!-- Health Stats -->
                    <p-card class="info-card">
                      <ng-template #header>
                        <div class="card-header">
                          <i class="pi pi-heart mr-2"></i>
                          <span>Gesundheitsstatus</span>
                        </div>
                      </ng-template>
                      <div class="info-grid">
                        @if (p.healthStats; as hs) {
                          <div class="info-item">
                            <label>Gesund</label>
                            <div class="value">
                              <p-tag
                                [severity]="hs.isHealthy ? 'success' : 'danger'"
                                [value]="hs.isHealthy ? 'Ja' : 'Nein'"
                              />
                            </div>
                          </div>
                          @if (!hs.isHealthy) {
                            <div class="info-item">
                              <label>Grund</label>
                              <div class="value">{{ hs.healthyReason }}</div>
                            </div>
                          }
                          <div class="info-item">
                            <label>Eingeschränkte Aktivitäten</label>
                            <div class="value">{{ hs.excludedActivities || 'Keine' }}</div>
                          </div>
                        } @else {
                          <p class="no-data">Keine Daten vorhanden.</p>
                        }
                      </div>
                    </p-card>

                    <!-- Camp Stats -->
                    <p-card class="info-card">
                      <ng-template #header>
                        <div class="card-header">
                          <i class="pi pi-map mr-2"></i>
                          <span>Lager-Informationen</span>
                        </div>
                      </ng-template>
                      <div class="info-grid">
                        @if (p.campStats; as cs) {
                          <div class="info-item">
                            <label>Zeckenimpfung</label>
                            <div class="value">
                              <p-tag
                                [severity]="cs.isTickVaccinated ? 'success' : 'secondary'"
                                [value]="cs.isTickVaccinated ? 'Ja' : 'Nein'"
                              />
                            </div>
                          </div>
                          <div class="info-item">
                            <label>Medikamentenabgabe</label>
                            <div class="value">
                              <p-tag
                                [severity]="cs.drugConsent ? 'success' : 'secondary'"
                                [value]="cs.drugConsent ? 'Ja' : 'Nein'"
                              />
                            </div>
                          </div>
                          <div class="info-item">
                            <label>AHV-Nummer</label>
                            <div class="value">{{ cs.ahv || '-' }}</div>
                          </div>
                          <div class="info-item">
                            <label>Krankenkasse</label>
                            <div class="value">{{ cs.krankenkasse || '-' }}</div>
                          </div>
                          <div class="info-item">
                            <label>Bemerkungen</label>
                            <div class="value">{{ cs.notes || 'Keine' }}</div>
                          </div>
                        } @else {
                          <p class="no-data">Keine Daten vorhanden.</p>
                        }
                      </div>
                    </p-card>

                    <!-- Intolerances -->
                    <p-card class="info-card full-width">
                      <ng-template #header>
                        <div class="card-header">
                          <i class="pi pi-exclamation-circle mr-2"></i>
                          <span>Allergien & Unverträglichkeiten</span>
                        </div>
                      </ng-template>
                      @if (p.intoleranceSelections.length === 0) {
                        <p>Keine Einträge vorhanden.</p>
                      } @else {
                        <div class="intolerance-grid">
                          @for (item of p.intoleranceSelections; track item.id) {
                            <div class="intolerance-item">
                              <div class="item-header">
                                <span class="item-label">{{ item.intolerance.definitionValue }}</span>
                                <p-tag
                                  [severity]="getSeverityColor(item.severity)"
                                  [value]="getSeverityLabel(item.severity)"
                                />
                              </div>
                              @if (item.customText) {
                                <div class="item-text">{{ item.customText }}</div>
                              }
                            </div>
                          }
                        </div>
                      }
                    </p-card>
                  </div>
                </div>
              </p-tabpanel>
              <p-tabpanel value="1">
                <pre class="json-box">{{ p | json }}</pre>
              </p-tabpanel>
            </p-tabpanels>
          </p-tabs>
        }
      </div>
    </div>
  `,
  styles: `
    .details-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .back-link {
      color: var(--p-primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .back-link:hover {
      text-decoration: underline;
    }
    .content {
      margin-top: 1rem;
    }
    .structured-view {
      padding: 1rem 0;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .card-header {
      padding: 1.25rem;
      font-weight: 600;
      font-size: 1.1rem;
      border-bottom: 1px solid var(--p-content-border-color);
      display: flex;
      align-items: center;
    }
    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .info-item label {
      display: block;
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    .info-item .value {
      font-weight: 500;
      color: var(--p-text-color);
    }
    .intolerance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .intolerance-item {
      padding: 1rem;
      background: var(--p-surface-500);
      border: 1px solid var(--p-content-border-color);
      border-radius: 6px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .item-label {
      font-weight: 600;
    }
    .item-text {
      font-size: 0.9rem;
      color: var(--p-text-muted-color);
      font-style: italic;
    }
    .no-data {
      color: var(--p-text-muted-color);
      font-style: italic;
      grid-column: span 2;
      margin: 0;
    }
    .json-box {
      background: var(--p-surface-900);
      color: var(--p-surface-0);
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-family: monospace;
    }
    .loading,
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
    }
    .error-message {
      color: var(--p-red-500);
      background: var(--p-red-50);
      border: 1px solid var(--p-red-100);
      border-radius: 6px;
    }
    .mr-2 {
      margin-right: 0.5rem;
    }

    @media (max-width: 600px) {
      .grid-container {
        grid-template-columns: 1fr;
      }
      .header-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `,
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
