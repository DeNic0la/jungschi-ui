import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Card } from 'primeng/card';
import { RoomService } from '../../shared/services/room.service';
import { RoomDto } from '../../shared/models/camp.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-room-lookup',
  imports: [RouterLink, FormsModule, InputText, Button, Message, Card, TranslatePipe],
  template: `
    <div class="page-container">
      <header
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          {{ 'features.team.roomLookup.title' | translate }}
        </h1>
        <p-button
          [label]="'common.actions.back' | translate"
          icon="pi pi-arrow-left"
          routerLink="/team"
          severity="secondary"
        />
      </header>

      <p-card>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div class="flex flex-col gap-2 w-full sm:w-64">
              <label for="roomId" class="font-semibold">Room ID</label>
              <input pInputText id="roomId" [(ngModel)]="roomIdInput" placeholder="e.g. 5" />
            </div>
            <p-button
              [label]="'common.actions.view' | translate"
              icon="pi pi-search"
              [loading]="loading()"
              (click)="lookup()"
            />
          </div>

          @if (error(); as err) {
            <p-message severity="error" [text]="err" />
          }

          @if (room(); as foundRoom) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><strong>ID:</strong> {{ foundRoom.id }}</div>
              <div><strong>Camp:</strong> {{ foundRoom.campId || '-' }}</div>
              <div><strong>Name:</strong> {{ foundRoom.name }}</div>
              <div><strong>Capacity:</strong> {{ foundRoom.maxCapacity ?? '-' }}</div>
              <div>
                <strong>{{ 'common.fields.gender' | translate }}:</strong>
                {{ ('common.gender.' + foundRoom.gender) | translate }}
              </div>
              <div class="sm:col-span-2">
                <strong>Leaders:</strong>
                {{ formatLeaders(foundRoom) || ('common.empty.none' | translate) }}
              </div>
            </div>
          }
        </div>
      </p-card>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomLookupComponent {
  private readonly roomService = inject(RoomService);
  private readonly translate = inject(TranslateService);

  protected roomIdInput = '';
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly room = signal<RoomDto | null>(null);

  protected lookup(): void {
    const id = Number(this.roomIdInput);
    if (Number.isNaN(id)) {
      this.error.set(this.translate.instant('features.team.healthDetails.messages.roomInvalidId'));
      this.room.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.roomService.getById(id).subscribe({
      next: (room) => {
        this.loading.set(false);
        this.room.set(room);
      },
      error: () => {
        this.loading.set(false);
        this.room.set(null);
        this.error.set(this.translate.instant('features.team.healthDetails.messages.roomLoadError'));
      },
    });
  }

  protected formatLeaders(room: RoomDto): string {
    return room.leaders
      .map((leader) => `${leader.firstName ?? ''} ${leader.lastName ?? ''}`.trim())
      .filter((name) => name.length > 0)
      .join(', ');
  }
}

