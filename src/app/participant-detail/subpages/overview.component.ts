import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, map, of, switchMap, Observable, filter } from 'rxjs';
import { Checkbox } from 'primeng/checkbox';
import { ParticipantService } from '../../services/participant.service';
import { CanComponentDeactivate } from '../../pending-changes.guard';

@Component({
  selector: 'app-participant-overview',
  imports: [CommonModule, Checkbox, FormsModule],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <i class="pi pi-spin pi-spinner spinner-icon" aria-hidden="true"></i>
        <span class="sr-only">Laden...</span>
      </div>
    } @else if (participant(); as p) {
      <div class="detail-grid mt-4">
        <div class="detail-item">
          <span class="detail-label">Geburtsdatum</span>
          <span class="detail-value">{{ p.dateOfBirth | date: 'dd.MM.yyyy' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Zuletzt aktualisiert</span>
          <span class="detail-value">{{ p.lastUpdatedAt | date: 'dd.MM.yyyy HH:mm' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Gesundheitsangaben</span>
          <span class="detail-value">
            <p-checkbox
              inputId="health-stats-completed"
              [binary]="true"
              [ngModel]="p.healthStats"
              [readonly]="true"
              size="large"
              label="Vollständig"
            />
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Lagerangaben</span>
          <span class="detail-value">
            <p-checkbox
              inputId="camp-stats-completed"
              [binary]="true"
              [ngModel]="p.campStats"
              [readonly]="true"
              size="large"
              label="Vollständig"
            />
          </span>
        </div>
      </div>
    } @else {
      <p>Teilnehmerdaten konnten nicht geladen werden.</p>
    }
  `,
  styles: `
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .detail-label {
      font-weight: 600;
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .detail-value {
      font-size: 1.125rem;
      color: var(--p-text-color);
    }
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 0;
    }
    .spinner-icon {
      font-size: 2rem;
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
    .mt-4 {
      margin-top: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantOverviewComponent implements CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly participantService = inject(ParticipantService);

  // We need the parent route's param if this is a child
  // But with withComponentInputBinding, it should be available as an input too if we declare it.
  // However, since it's a child, the param is on the parent.
  // We can use inject(ActivatedRoute).parent.params

  id$: Observable<string | null> = (
    (this.route.parent?.paramMap as Observable<ParamMap | null>) ?? of(null)
  ).pipe(map((params: ParamMap | null) => params?.get('id') ?? null));

  participant = toSignal(
    this.id$.pipe(
      map((id: string | null) => (id ? Number(id) : NaN)),
      filter((id: number) => !isNaN(id)),
      switchMap((id: number) => this.participantService.info(id).pipe(catchError(() => of(null)))),
    ),
  );

  loading = computed(() => this.participant() === undefined);

  isDirty(): boolean {
    return false;
  }
}
