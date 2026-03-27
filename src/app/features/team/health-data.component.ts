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
import { TeamService } from '../../shared/services/team.service';
import { TeamParticipantDto } from '../../shared/models/team-participant.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-health-data',
  imports: [CommonModule, RouterLink, TableModule, InputText, IconField, InputIcon, Button],
  template: `
    <div class="page-container">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Gesundheitsdaten</h1>
        <p-button
          label="Zurück"
          icon="pi pi-arrow-left"
          routerLink="/team"
          severity="secondary"
          class="w-full sm:w-auto"
        />
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
          <div class="flex justify-end">
            <p-iconfield iconPosition="left" class="w-full sm:w-auto">
              <p-inputicon class="pi pi-search" />
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter($event)"
                placeholder="Suchen..."
                class="w-full"
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
  styles: ``,
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
