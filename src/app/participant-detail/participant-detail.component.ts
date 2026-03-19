import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { ParticipantService } from '../services/participant.service';

@Component({
  selector: 'app-participant-detail',
  imports: [CommonModule, Card, Button, Tabs, TabList, Tab, RouterLink, RouterOutlet],
  template: `
    <div class="container">
      <header class="flex-header">
        <h1 class="title">Teilnehmer-Details</h1>
        <p-button
          label="Zurück zur Liste"
          icon="pi pi-arrow-left"
          [routerLink]="['/participants']"
          severity="secondary" />
      </header>

      @if (loading()) {
        <div class="loading-container">
          <i class="pi pi-spin pi-spinner spinner-icon" aria-hidden="true"></i>
          <span class="sr-only">Laden...</span>
        </div>
      } @else if (participant(); as p) {
        <p-card [header]="p.firstname + ' ' + p.lastname">
          <p-tabs [value]="activeTab()">
            <p-tablist>
              <p-tab [value]="'/participants/' + id()" [routerLink]="['/participants', id()]">
                <i class="pi pi-info-circle mr-2"></i> Übersicht
              </p-tab>
              <p-tab
                [value]="'/participants/' + id() + '/health-stats'"
                [routerLink]="['/participants', id(), 'health-stats']">
                <i class="pi pi-heart mr-2"></i> Gesundheitsinfo
              </p-tab>
              <p-tab
                [value]="'/participants/' + id() + '/camp-stats'"
                [routerLink]="['/participants', id(), 'camp-stats']">
                <i class="pi pi-map mr-2"></i> Lager Daten
              </p-tab>
              <p-tab
                [value]="'/participants/' + id() + '/allergy'"
                [routerLink]="['/participants', id(), 'allergy']">
                <i class="pi pi-exclamation-triangle mr-2"></i> Allergien & Essen
              </p-tab>
            </p-tablist>
          </p-tabs>
          <div class="subpage-content">
            <router-outlet />
          </div>
        </p-card>
      } @else {
        <p-card header="Fehler">
          <p>Teilnehmer mit der ID {{ id() }} konnte nicht gefunden werden.</p>
          <p-button label="Zurück zur Liste" icon="pi pi-arrow-left" [routerLink]="['/participants']" />
        </p-card>
      }
    </div>
  `,
  styles: `
    .container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .flex-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .title {
      margin: 0;
      font-size: 1.75rem;
      color: var(--p-text-color);
    }
    .subpage-content {
      padding: 1rem 0;
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
    .mr-2 {
      margin-right: 0.5rem;
    }
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
      switchMap((id: number) =>
        this.participantService.get(id).pipe(catchError(() => of(null)))
      )
    )
  );

  loading = computed(() => this.participant() === undefined);

  activeTab = computed(() => this.router.url.split('?')[0]);
}
