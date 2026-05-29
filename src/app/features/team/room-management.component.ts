import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { TranslatePipe } from '@ngx-translate/core';
import { CampDto, RoomDto, RoomInput } from '../../shared/models/camp.model';
import { Gender } from '../../shared/models/participant.model';
import { TeamUserDto } from '../../shared/models/user.model';
import { CampService } from '../../shared/services/camp.service';
import { RoomService } from '../../shared/services/room.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-room-management',
  imports: [CommonModule, FormsModule, RouterLink, Button, Card, InputText, Message, TranslatePipe],
  template: `
    <div class="page-container">
      <header class="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          {{ 'features.team.roomManagement.title' | translate }}
        </h1>
        <p-button
          [label]="'common.actions.back' | translate"
          icon="pi pi-arrow-left"
          routerLink="/team"
          severity="secondary"
        />
      </header>

      @if (loadError()) {
        <p-message
          severity="error"
          [text]="'features.team.roomManagement.messages.loadError' | translate"
        />
      }

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] gap-6">
        <p-card [header]="formTitle() | translate">
          <form class="flex flex-col gap-4" (ngSubmit)="saveRoom()">
            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.roomManagement.fields.camp' | translate }}
              <select
                class="p-inputtext p-component w-full"
                [(ngModel)]="draft.campId"
                name="campId"
                (ngModelChange)="selectCamp($event)"
              >
                @for (camp of camps(); track camp.id) {
                  <option [ngValue]="camp.id">{{ camp.title }}</option>
                }
              </select>
            </label>

            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.roomManagement.fields.name' | translate }}
              <input pInputText [(ngModel)]="draft.name" name="name" required />
            </label>

            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.roomManagement.fields.maxCapacity' | translate }}
              <input
                pInputText
                type="number"
                min="1"
                [(ngModel)]="draft.maxCapacity"
                name="maxCapacity"
              />
            </label>

            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.roomManagement.fields.gender' | translate }}
              <select
                class="p-inputtext p-component w-full"
                [(ngModel)]="draft.gender"
                name="gender"
              >
                <option [ngValue]="null">{{ 'common.empty.none' | translate }}</option>
                <option [ngValue]="'male'">{{ 'common.gender.male' | translate }}</option>
                <option [ngValue]="'female'">{{ 'common.gender.female' | translate }}</option>
                <option [ngValue]="'else'">{{ 'common.gender.else' | translate }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-2 font-semibold">
              {{ 'features.team.roomManagement.fields.leaders' | translate }}
              <div
                class="grid grid-cols-1 gap-2 rounded-md border border-surface-200 dark:border-surface-700 p-3 max-h-72 overflow-auto"
              >
                @for (leader of leaders(); track leader.email) {
                  <label
                    class="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-50 dark:hover:bg-surface-800"
                  >
                    <input
                      type="checkbox"
                      class="h-4 w-4"
                      [checked]="leaderSelected(leader.email)"
                      (change)="toggleLeader(leader.email, $any($event.target).checked)"
                    />
                    <span class="min-w-0">
                      <span class="block truncate">{{ displayLeader(leader) }}</span>
                      <span class="block truncate text-xs font-normal text-surface-500">
                        {{ leader.email }}
                      </span>
                    </span>
                  </label>
                } @empty {
                  <span class="text-sm font-normal text-surface-500">
                    {{ 'features.team.roomManagement.emptyLeaders' | translate }}
                  </span>
                }
              </div>
            </label>

            <div class="flex flex-col sm:flex-row gap-2">
              <p-button
                type="submit"
                [label]="'common.actions.save' | translate"
                icon="pi pi-save"
                [disabled]="!draft.name.trim() || !draft.campId"
              />
              <p-button
                type="button"
                [label]="'common.actions.cancel' | translate"
                icon="pi pi-times"
                severity="secondary"
                (click)="resetDraft()"
              />
            </div>
          </form>
        </p-card>

        <div class="flex flex-col gap-4 min-w-0">
          @for (room of rooms(); track room.id) {
            <p-card>
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div class="min-w-0">
                  <h2 class="text-lg font-semibold m-0 truncate">{{ room.name }}</h2>
                  <p class="text-sm text-surface-500 mt-1 mb-0">
                    {{ 'features.team.roomManagement.fields.maxCapacity' | translate }}:
                    {{ room.maxCapacity ?? '-' }}
                  </p>
                  <p class="text-sm text-surface-500 mt-1 mb-0">
                    {{ 'features.team.roomManagement.fields.assignedCount' | translate }}:
                    {{ room.assignedCount }}
                    @if (room.remainingCapacity !== null) {
                      / {{ room.maxCapacity }}
                    }
                  </p>
                  <p class="text-sm text-surface-500 mt-1 mb-0">
                    {{ 'features.team.roomManagement.fields.gender' | translate }}:
                    {{
                      room.gender
                        ? ('common.gender.' + room.gender | translate)
                        : ('common.empty.none' | translate)
                    }}
                  </p>
                  <p class="text-sm text-surface-500 mt-1 mb-0">
                    {{ 'features.team.roomManagement.fields.leaders' | translate }}:
                    {{ leaderNames(room) || ('common.empty.none' | translate) }}
                  </p>
                </div>
                <div class="flex gap-2 shrink-0">
                  <p-button
                    icon="pi pi-pencil"
                    severity="secondary"
                    [attr.aria-label]="'common.actions.edit' | translate"
                    (click)="editRoom(room)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [attr.aria-label]="'common.actions.delete' | translate"
                    (click)="deleteRoom(room)"
                  />
                </div>
              </div>
            </p-card>
          } @empty {
            <p-message severity="info" [text]="'features.team.roomManagement.empty' | translate" />
          }
        </div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomManagementComponent {
  private readonly campService = inject(CampService);
  private readonly roomService = inject(RoomService);
  private readonly userService = inject(UserService);

  protected readonly camps = signal<CampDto[]>([]);
  protected readonly rooms = signal<RoomDto[]>([]);
  protected readonly leaders = signal<TeamUserDto[]>([]);
  protected readonly loadError = signal(false);
  protected editingRoomId: number | null = null;
  protected draft: RoomInput = this.emptyDraft();

  constructor() {
    this.campService.getAll().subscribe({
      next: (camps) => {
        this.camps.set(camps);
        if (camps[0]) {
          this.draft = { ...this.draft, campId: camps[0].id };
          this.loadRooms(camps[0].id);
        }
      },
      error: () => this.loadError.set(true),
    });
    this.userService.getTeamUsers().subscribe({
      next: (leaders) => this.leaders.set(leaders),
      error: () => this.loadError.set(true),
    });
  }

  protected selectCamp(campId: string): void {
    this.loadRooms(campId);
  }

  protected formTitle(): string {
    return this.editingRoomId
      ? 'features.team.roomManagement.form.edit'
      : 'features.team.roomManagement.form.create';
  }

  protected saveRoom(): void {
    const payload = { ...this.draft, name: this.draft.name.trim() };
    const request = this.editingRoomId
      ? this.roomService.update(this.editingRoomId, payload)
      : this.roomService.create(payload);
    request.subscribe({
      next: () => {
        this.loadRooms(payload.campId);
        this.resetDraft(payload.campId);
      },
      error: () => this.loadError.set(true),
    });
  }

  protected editRoom(room: RoomDto): void {
    this.editingRoomId = room.id;
    this.draft = {
      campId: room.campId ?? this.draft.campId,
      name: room.name,
      maxCapacity: room.maxCapacity,
      gender: room.gender,
      leaderEmails: room.leaders.map((leader) => leader.id),
    };
  }

  protected deleteRoom(room: RoomDto): void {
    this.roomService.delete(room.id).subscribe({
      next: () => this.loadRooms(room.campId ?? this.draft.campId),
      error: () => this.loadError.set(true),
    });
  }

  protected resetDraft(campId = this.draft.campId): void {
    this.editingRoomId = null;
    this.draft = this.emptyDraft(campId);
  }

  protected displayLeader(leader: TeamUserDto): string {
    return (
      `${leader.firstName ?? ''} ${leader.lastName ?? ''}`.trim() || leader.username || leader.email
    );
  }

  protected leaderSelected(email: string): boolean {
    return this.draft.leaderEmails.includes(email);
  }

  protected toggleLeader(email: string, selected: boolean): void {
    const current = new Set(this.draft.leaderEmails);
    if (selected) {
      current.add(email);
    } else {
      current.delete(email);
    }
    this.draft = {
      ...this.draft,
      leaderEmails: [...current],
    };
  }

  protected leaderNames(room: RoomDto): string {
    return room.leaders
      .map((leader) => `${leader.firstName ?? ''} ${leader.lastName ?? ''}`.trim() || leader.id)
      .join(', ');
  }

  private loadRooms(campId: string): void {
    if (!campId) {
      return;
    }
    this.roomService.getForCamp(campId).subscribe({
      next: (rooms) => this.rooms.set(rooms),
      error: () => this.loadError.set(true),
    });
  }

  private emptyDraft(campId = ''): RoomInput {
    return {
      campId,
      name: '',
      maxCapacity: null,
      gender: null as Gender | null,
      leaderEmails: [],
    };
  }
}
