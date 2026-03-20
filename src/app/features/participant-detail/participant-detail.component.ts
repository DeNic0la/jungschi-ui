import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { ParticipantService } from '../../shared/services/participant.service';

@Component({
  selector: 'app-participant-detail',
  imports: [CommonModule, Card, Button, Tabs, TabList, Tab, RouterLink, RouterOutlet],
  template: `
    <div class="page-container">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Teilnehmer-Details</h1>
        <p-button
          label="Zurück zur Liste"
          icon="pi pi-arrow-left"
          [routerLink]="['/participants']"
          severity="secondary"
          class="w-full sm:w-auto"
        />
      </header>

      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <i class="pi pi-spin pi-spinner text-4xl text-primary" aria-hidden="true"></i>
          <span class="sr-only">Laden...</span>
        </div>
      } @else if (participant(); as p) {
        <p-card [header]="p.firstname + ' ' + p.lastname">
          <p-tabs [value]="activeTab()">
            <p-tablist>
              <p-tab
                [value]="'/participants/' + id() + '/overview'"
                [routerLink]="['/participants', id(), 'overview']"
              >
                <i class="pi pi-info-circle mr-2"></i>
                <span class="hidden sm:inline">Übersicht</span>
              </p-tab>
              <p-tab
                [value]="'/participants/' + id() + '/health-stats'"
                [routerLink]="['/participants', id(), 'health-stats']"
              >
                <i class="pi pi-heart mr-2"></i>
                <span class="hidden sm:inline">Gesundheitsinfo</span>
              </p-tab>
              <p-tab
                [value]="'/participants/' + id() + '/camp-stats'"
                [routerLink]="['/participants', id(), 'camp-stats']"
              >
                <i class="pi pi-map mr-2"></i>
                <span class="hidden sm:inline">Lager Daten</span>
              </p-tab>
              <p-tab
                [value]="'/participants/' + id() + '/allergy'"
                [routerLink]="['/participants', id(), 'allergy']"
              >
                <i class="pi pi-exclamation-triangle mr-2"></i>
                <span class="hidden sm:inline">Allergien & Essen</span>
              </p-tab>
            </p-tablist>
          </p-tabs>
          <div class="pt-6">
            <router-outlet />
          </div>
        </p-card>
      } @else {
        <p-card header="Fehler">
          <p class="mb-4 text-surface-600 dark:text-surface-400">
            Teilnehmer mit der ID {{ id() }} konnte nicht gefunden werden.
          </p>
          <p-button
            label="Zurück zur Liste"
            icon="pi pi-arrow-left"
            [routerLink]="['/participants']"
          />
        </p-card>
      }
    </div>
  `,
  styles: `

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantDetailComponent {
  private readonly participantService = inject(ParticipantService);
  protected readonly router = inject(Router);

  // Router param input
  id = input.required<string>();

  participant = toSignal(
    toObservable(this.id).pipe(
      map((id: string) => Number(id)),
      filter((id: number) => !isNaN(id)),
      switchMap((id: number) => this.participantService.get(id).pipe(catchError(() => of(null)))),
    ),
  );

  loading = computed(() => this.participant() === undefined);

  activeTab = computed(() => this.router.url.split('?')[0]);
}
