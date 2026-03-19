import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TeamService } from '../services/team.service';
import { TeamParticipantDto } from '../models/team-participant.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-health-data',
  imports: [CommonModule, RouterLink, TableModule, InputText, IconField, InputIcon, Button],
  template: `
    <div class="health-data-container">
      <header class="flex-header">
        <h1>Gesundheitsdaten</h1>
        <p-button label="Zurück" icon="pi pi-arrow-left" routerLink="/team" severity="secondary" />
      </header>

      <p-table
        #dt
        [value]="participants()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['firstname', 'lastname']"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Zeige {first} bis {last} von {totalRecords} Teilnehmern"
        [showCurrentPageReport]="true"
        [loading]="loading()"
      >
        <ng-template #caption>
          <div class="flex justify-between items-center">
            <p-iconfield iconPosition="left">
              <p-inputicon class="pi pi-search" />
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter($event)"
                placeholder="Suchen..."
              />
            </p-iconfield>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="firstname">Vorname <p-sortIcon field="firstname" /></th>
            <th pSortableColumn="lastname">Nachname <p-sortIcon field="lastname" /></th>
            <th pSortableColumn="dateOfBirth">Geburtsdatum <p-sortIcon field="dateOfBirth" /></th>
            <th style="width: 8rem">Aktionen</th>
          </tr>
        </ng-template>
        <ng-template #body let-participant>
          <tr>
            <td>{{ participant.firstname }}</td>
            <td>{{ participant.lastname }}</td>
            <td>{{ participant.dateOfBirth | date: 'dd.MM.yyyy' }}</td>
            <td>
              <p-button
                icon="pi pi-search"
                [rounded]="true"
                severity="info"
                [routerLink]="['/team/health-data', participant.id, 'details']"
                aria-label="Details anzeigen"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="4">Keine Teilnehmer gefunden.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: `
    .health-data-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .flex-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    :host ::ng-deep .p-datatable-header {
      background: transparent;
      padding: 1rem 0;
    }
    .flex {
      display: flex;
    }
    .justify-between {
      justify-content: space-between;
    }
    .items-center {
      align-items: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthDataComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly dt = viewChild<Table>('dt');

  protected readonly participants = signal<TeamParticipantDto[]>([]);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loadParticipants();
  }

  private async loadParticipants(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.teamService.getAllParticipants());
      this.participants.set(data);
    } catch (err) {
      console.error('Failed to load team participants', err);
    } finally {
      this.loading.set(false);
    }
  }

  protected onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt()?.filterGlobal(input.value, 'contains');
  }
}
