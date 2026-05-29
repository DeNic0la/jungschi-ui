import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CampDto, RoomDto } from '../../shared/models/camp.model';
import {
  CampParticipantDetailDto,
  SignupState,
  TeamCampParticipantDto,
  TeamSignupDto,
} from '../../shared/models/signup.model';
import { CampService } from '../../shared/services/camp.service';
import { RoomService } from '../../shared/services/room.service';
import { SignupService } from '../../shared/services/signup.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-camp-signups',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Button,
    Card,
    Dialog,
    Message,
    Tag,
    TextareaModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <header class="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
            {{ 'features.team.signups.title' | translate }}
          </h1>
        </div>
        <p-button
          [label]="'common.actions.back' | translate"
          icon="pi pi-arrow-left"
          routerLink="/team"
          severity="secondary"
        />
      </header>

      <p-card styleClass="mb-6">
        <div class="flex flex-col md:flex-row md:items-end gap-4">
          <label class="flex flex-col gap-2 font-semibold min-w-0 md:w-96">
            {{ 'features.team.signups.fields.camp' | translate }}
            <select
              class="p-inputtext p-component w-full"
              [ngModel]="selectedCampId()"
              (ngModelChange)="selectCamp($event)"
            >
              @for (camp of camps(); track camp.id) {
                <option [ngValue]="camp.id">{{ camp.title }}</option>
              }
            </select>
          </label>
          <p-button
            [label]="'common.actions.refresh' | translate"
            icon="pi pi-refresh"
            severity="secondary"
            (click)="reload()"
          />
        </div>
      </p-card>

      @if (loadError()) {
        <p-message
          severity="error"
          [text]="'features.team.signups.messages.loadError' | translate"
        />
      }

      <div class="flex flex-col gap-5">
        @for (signup of signups(); track signup.id) {
          <p-card>
            <div class="flex flex-col gap-5">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 class="text-xl font-semibold m-0">
                    {{ 'features.team.signups.signupTitle' | translate: { id: signup.id } }}
                  </h2>
                  <p class="text-sm text-surface-500 mt-1 mb-0">
                    {{ 'features.team.signups.fields.household' | translate }}:
                    {{ signup.householdId ?? '-' }}
                  </p>
                </div>
                <p-tag
                  [value]="stateLabel(signup.state)"
                  [severity]="stateSeverity(signup.state)"
                />
              </div>

              <dl class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm m-0">
                <div>
                  <dt class="font-semibold text-surface-500">
                    {{ 'features.signup.form.photoConsent.label' | translate }}
                  </dt>
                  <dd class="m-0">{{ booleanLabel(signup.photoConsent) }}</dd>
                </div>
                <div>
                  <dt class="font-semibold text-surface-500">
                    {{ 'features.signup.form.infoEmail.label' | translate }}
                  </dt>
                  <dd class="m-0">{{ booleanLabel(signup.infoEmail) }}</dd>
                </div>
                <div class="sm:col-span-3">
                  <dt class="font-semibold text-surface-500">
                    {{
                      'features.signup.form.additionalContactOptionsDuringCamp.label' | translate
                    }}
                  </dt>
                  <dd class="m-0">{{ signup.additionalContactOptionsDuringCamp || '-' }}</dd>
                </div>
              </dl>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                @for (campParticipant of signup.campParticipants; track campParticipant.id) {
                  <section
                    class="border border-surface-200 dark:border-surface-700 rounded-md p-4 min-w-0"
                  >
                    <div class="flex flex-col gap-3">
                      <div>
                        <h3 class="text-base font-semibold m-0">
                          {{ campParticipant.firstname }} {{ campParticipant.lastname }}
                        </h3>
                        <p class="text-sm text-surface-500 mt-1 mb-0">
                          {{ campParticipant.schoolClass || '-' }}
                        </p>
                      </div>
                      <div class="text-sm">
                        @if (campParticipant.roomLeaderInfoVisible) {
                          <div>
                            <strong
                              >{{
                                'features.signup.form.infosZimmerleitung.label' | translate
                              }}:</strong
                            >
                            {{ campParticipant.infosZimmerleitung || '-' }}
                          </div>
                        } @else {
                          <div class="text-surface-500">
                            {{
                              'features.team.signups.privacy.roomLeaderInfoHidden' | translate
                            }}
                          </div>
                        }
                        @if (campParticipant.fullAccess) {
                          <div>
                            <strong
                              >{{ 'features.signup.form.bemerkungen.label' | translate }}:</strong
                            >
                            {{ campParticipant.bemerkungen || '-' }}
                          </div>
                          <div>
                            <strong
                              >{{ 'features.signup.form.drugConsent.label' | translate }}:</strong
                            >
                            {{ nullableBooleanLabel(campParticipant.drugConsent) }}
                          </div>
                        } @else {
                          <div class="text-surface-500">
                            {{ 'features.team.signups.privacy.sensitiveDataHidden' | translate }}
                          </div>
                        }
                        <div>
                          <strong
                            >{{ 'features.team.signups.fields.currentRoom' | translate }}:</strong
                          >
                          {{ campParticipant.roomName || '-' }}
                        </div>
                      </div>
                      <label class="flex flex-col gap-2 font-semibold">
                        {{ 'features.team.signups.fields.room' | translate }}
                        <select
                          class="p-inputtext p-component w-full"
                          [ngModel]="campParticipant.roomId"
                          (ngModelChange)="assignRoom(campParticipant.id, $event)"
                        >
                          <option [ngValue]="null">{{ 'common.empty.none' | translate }}</option>
                          @for (room of availableRoomsFor(campParticipant); track room.id) {
                            <option [ngValue]="room.id">{{ roomLabel(room) }}</option>
                          }
                        </select>
                      </label>
                      <button
                        type="button"
                        class="p-button p-component p-button-secondary w-fit"
                        (click)="openCampParticipant(campParticipant)"
                      >
                        <span class="pi pi-eye p-button-icon p-button-icon-left"></span>
                        <span class="p-button-label">
                          {{ 'features.team.signups.actions.showParticipantDetails' | translate }}
                        </span>
                      </button>
                    </div>
                  </section>
                }
              </div>

              <label class="flex flex-col gap-2 font-semibold">
                {{ 'features.team.signups.fields.feedback' | translate }}
                <textarea
                  pTextarea
                  rows="3"
                  [autoResize]="true"
                  [ngModel]="feedbackDraft(signup)"
                  (ngModelChange)="setFeedbackDraft(signup.id, $event)"
                ></textarea>
              </label>

              <div class="flex flex-col sm:flex-row justify-end gap-2">
                <p-button
                  [label]="'features.team.signups.actions.saveFeedback' | translate"
                  icon="pi pi-save"
                  severity="secondary"
                  (click)="saveFeedback(signup)"
                />
                <p-button
                  [label]="'features.team.signups.actions.reject' | translate"
                  icon="pi pi-times"
                  severity="warn"
                  [disabled]="!feedbackDraft(signup).trim()"
                  (click)="reject(signup)"
                />
                <p-button
                  [label]="'features.team.signups.actions.approve' | translate"
                  icon="pi pi-check"
                  [disabled]="signup.state !== 'COMPLETED'"
                  (click)="approve(signup)"
                />
              </div>
            </div>
          </p-card>
        } @empty {
          <p-message severity="info" [text]="'features.team.signups.empty' | translate" />
        }
      </div>

      <p-dialog
        [header]="'features.team.signups.detail.title' | translate"
        [modal]="true"
        [style]="{ width: 'min(48rem, calc(100vw - 2rem))' }"
        [draggable]="false"
        [(visible)]="detailVisible"
        (onHide)="closeCampParticipant()"
      >
        @if (selectedDetail(); as detail) {
          <div class="flex flex-col gap-5">
            @if (!detail.fullAccess) {
              <p-message
                severity="info"
                [text]="'features.team.signups.privacy.modalFiltered' | translate"
              />
            }
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm m-0">
              <div>
                <dt class="font-semibold text-surface-500">
                  {{ 'common.fields.name' | translate }}
                </dt>
                <dd class="m-0">{{ detail.firstname }} {{ detail.lastname }}</dd>
              </div>
              <div>
                <dt class="font-semibold text-surface-500">
                  {{ 'common.fields.gender' | translate }}
                </dt>
                <dd class="m-0">
                  {{
                    detail.gender
                      ? ('common.gender.' + detail.gender | translate)
                      : ('common.empty.none' | translate)
                  }}
                </dd>
              </div>
              @if (detail.dateOfBirth) {
                <div>
                  <dt class="font-semibold text-surface-500">
                    {{ 'common.fields.dateOfBirth' | translate }}
                  </dt>
                  <dd class="m-0">{{ detail.dateOfBirth | date: 'dd.MM.yyyy' }}</dd>
                </div>
              }
              <div>
                <dt class="font-semibold text-surface-500">
                  {{ 'features.signup.form.schoolClass.label' | translate }}
                </dt>
                <dd class="m-0">{{ detail.schoolClass || '-' }}</dd>
              </div>
              <div>
                <dt class="font-semibold text-surface-500">
                  {{ 'features.team.signups.fields.currentRoom' | translate }}
                </dt>
                <dd class="m-0">{{ detail.roomName || '-' }}</dd>
              </div>
              @if (detail.roomLeaderInfoVisible) {
                <div class="sm:col-span-2">
                  <dt class="font-semibold text-surface-500">
                    {{ 'features.signup.form.infosZimmerleitung.label' | translate }}
                  </dt>
                  <dd class="m-0 whitespace-pre-wrap">{{ detail.infosZimmerleitung || '-' }}</dd>
                </div>
              }
              @if (detail.fullAccess) {
                <div class="sm:col-span-2">
                  <dt class="font-semibold text-surface-500">
                    {{ 'features.signup.form.bemerkungen.label' | translate }}
                  </dt>
                  <dd class="m-0 whitespace-pre-wrap">{{ detail.bemerkungen || '-' }}</dd>
                </div>
                <div>
                  <dt class="font-semibold text-surface-500">
                    {{ 'features.signup.form.drugConsent.label' | translate }}
                  </dt>
                  <dd class="m-0">{{ nullableBooleanLabel(detail.drugConsent) }}</dd>
                </div>
              }
            </dl>

            @if (detail.fullAccess) {
              <section>
                <h3 class="text-base font-semibold mt-0 mb-3">
                  {{ 'features.signup.sections.medication' | translate }}
                </h3>
                <div class="flex flex-col gap-3">
                  @for (medication of detail.medications; track $index) {
                    <div
                      class="rounded-md border border-surface-200 dark:border-surface-700 p-3 text-sm"
                    >
                      <strong>{{ medication.medicationName }}</strong>
                      <div>{{ medication.dose || '-' }} · {{ medication.frequency || '-' }}</div>
                      <div>{{ medication.purpose || '-' }}</div>
                    </div>
                  } @empty {
                    <p class="m-0 text-sm text-surface-500">{{ 'common.empty.none' | translate }}</p>
                  }
                </div>
              </section>
            }
          </div>
        }
      </p-dialog>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampSignupsComponent {
  private readonly campService = inject(CampService);
  private readonly roomService = inject(RoomService);
  private readonly signupService = inject(SignupService);
  private readonly translate = inject(TranslateService);

  protected readonly camps = signal<CampDto[]>([]);
  protected readonly signups = signal<TeamSignupDto[]>([]);
  protected readonly availableRooms = signal<Record<number, RoomDto[]>>({});
  protected readonly selectedCampId = signal<string | null>(null);
  protected readonly feedbackDrafts = signal<Record<number, string>>({});
  protected readonly selectedDetail = signal<CampParticipantDetailDto | null>(null);
  protected detailVisible = false;
  protected readonly loadError = signal(false);

  constructor() {
    this.campService.getAll().subscribe({
      next: (camps) => {
        this.camps.set(camps);
        if (camps[0]) {
          this.selectCamp(camps[0].id);
        }
      },
      error: () => this.loadError.set(true),
    });
  }

  protected selectCamp(campId: string): void {
    this.selectedCampId.set(campId);
    this.reload();
  }

  protected reload(): void {
    const campId = this.selectedCampId();
    if (!campId) {
      return;
    }
    this.loadError.set(false);
    this.signupService.getForCampReview(campId).subscribe({
      next: (signups) => {
        const sorted = this.sortSignups(signups);
        this.signups.set(sorted);
        this.feedbackDrafts.set(
          Object.fromEntries(signups.map((signup) => [signup.id, signup.feedback ?? ''])),
        );
        this.loadAvailableRooms(campId, sorted);
      },
      error: () => this.loadError.set(true),
    });
  }

  protected feedbackDraft(signup: TeamSignupDto): string {
    return this.feedbackDrafts()[signup.id] ?? signup.feedback ?? '';
  }

  protected setFeedbackDraft(signupId: number, feedback: string): void {
    this.feedbackDrafts.update((current) => ({ ...current, [signupId]: feedback }));
  }

  protected saveFeedback(signup: TeamSignupDto): void {
    this.signupService.updateFeedback(signup.id, this.feedbackDraft(signup)).subscribe({
      next: (updated) => this.replaceSignup(updated),
      error: () => this.loadError.set(true),
    });
  }

  protected reject(signup: TeamSignupDto): void {
    this.signupService.reject(signup.id, this.feedbackDraft(signup).trim()).subscribe({
      next: (updated) => this.replaceSignup(updated),
      error: () => this.loadError.set(true),
    });
  }

  protected approve(signup: TeamSignupDto): void {
    this.signupService.approve(signup.id).subscribe({
      next: (updated) => this.replaceSignup(updated),
      error: () => this.loadError.set(true),
    });
  }

  protected assignRoom(campParticipantId: number, rawRoomId: number | null): void {
    const roomId = rawRoomId === null ? null : Number(rawRoomId);
    this.signupService.assignRoom(campParticipantId, roomId).subscribe({
      next: (updated) => {
        this.replaceSignup(updated);
        const campId = this.selectedCampId();
        if (campId) {
          this.loadAvailableRooms(campId, this.signups());
        }
      },
      error: () => this.loadError.set(true),
    });
  }

  protected availableRoomsFor(campParticipant: TeamCampParticipantDto): RoomDto[] {
    return this.availableRooms()[campParticipant.id] ?? [];
  }

  protected openCampParticipant(campParticipant: TeamCampParticipantDto): void {
    this.selectedDetail.set({ ...campParticipant, dateOfBirth: null });
    this.detailVisible = true;
    this.signupService.getCampParticipant(campParticipant.id).subscribe({
      next: (detail) => {
        this.selectedDetail.set(detail);
      },
      error: () => this.loadError.set(true),
    });
  }

  protected closeCampParticipant(): void {
    this.detailVisible = false;
    this.selectedDetail.set(null);
  }

  protected stateLabel(state: SignupState): string {
    return this.translate.instant(`features.signup.states.${state}`);
  }

  protected stateSeverity(state: SignupState): 'success' | 'warn' | 'info' {
    if (state === 'APPROVED') return 'success';
    if (state === 'COMPLETED') return 'info';
    return 'warn';
  }

  protected booleanLabel(value: boolean): string {
    return this.translate.instant(value ? 'common.boolean.yes' : 'common.boolean.no');
  }

  protected nullableBooleanLabel(value: boolean | null): string {
    return value === null ? '-' : this.booleanLabel(value);
  }

  protected roomLabel(room: RoomDto): string {
    const capacity =
      room.remainingCapacity === null
        ? ''
        : ` (${room.assignedCount}/${room.maxCapacity ?? '-'})`;
    return `${room.name}${capacity}`;
  }

  private replaceSignup(updated: TeamSignupDto): void {
    this.signups.update((current) =>
      this.sortSignups(current.map((signup) => (signup.id === updated.id ? updated : signup))),
    );
    this.setFeedbackDraft(updated.id, updated.feedback ?? '');
  }

  private loadAvailableRooms(campId: string, signups: TeamSignupDto[]): void {
    const campParticipantIds = signups.flatMap((signup) =>
      signup.campParticipants.map((campParticipant) => campParticipant.id),
    );
    if (campParticipantIds.length === 0) {
      this.availableRooms.set({});
      return;
    }
    const requests = Object.fromEntries(
      campParticipantIds.map((id) => [
        id,
        this.roomService.getAvailableForCampParticipant(campId, id).pipe(catchError(() => of([]))),
      ]),
    ) as Record<number, ReturnType<RoomService['getAvailableForCampParticipant']>>;
    forkJoin(requests).subscribe({
      next: (roomsByParticipant) => this.availableRooms.set(roomsByParticipant),
      error: () => this.loadError.set(true),
    });
  }

  private sortSignups(signups: TeamSignupDto[]): TeamSignupDto[] {
    return [...signups].sort(
      (a, b) => this.stateOrder(a.state) - this.stateOrder(b.state) || a.id - b.id,
    );
  }

  private stateOrder(state: SignupState): number {
    if (state === 'COMPLETED') return 0;
    if (state === 'IN_PROGRESS') return 1;
    return 2;
  }
}
