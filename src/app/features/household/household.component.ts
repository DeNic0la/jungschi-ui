import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  HouseholdDto,
  HouseholdGuardianContactType,
  HouseholdGuardianDto,
} from '../../shared/models/household.model';
import { HouseholdService } from '../../shared/services/household.service';

@Component({
  selector: 'app-household',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    Card,
    InputText,
    Message,
    Tag,
    TranslatePipe,
  ],
  template: `
    <div class="page-container">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          {{ 'features.household.title' | translate }}
        </h1>
      </header>

      @if (loading()) {
        <p-message severity="info" [text]="'common.status.loading' | translate" />
      } @else if (error(); as err) {
        <p-message severity="error" [text]="err" />
      } @else {
        <div
          class="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] gap-6"
        >
          <p-card [header]="'features.household.sections.address' | translate" styleClass="min-w-0">
            <form
              [formGroup]="householdForm"
              (ngSubmit)="saveHousehold()"
              class="flex flex-col gap-5"
            >
              <div class="flex flex-col gap-2">
                <label for="streetAndNumber" class="font-semibold">
                  {{ 'features.household.form.streetAndNumber.label' | translate }}
                </label>
                <input pInputText id="streetAndNumber" formControlName="streetAndNumber" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-[9rem_minmax(0,1fr)] gap-4">
                <div class="flex flex-col gap-2">
                  <label for="plz" class="font-semibold">
                    {{ 'features.household.form.plz.label' | translate }}
                  </label>
                  <input pInputText id="plz" formControlName="plz" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="place" class="font-semibold">
                    {{ 'features.household.form.place.label' | translate }}
                  </label>
                  <input pInputText id="place" formControlName="place" />
                </div>
              </div>

              <div class="flex items-center gap-3">
                <p-button
                  [label]="'common.actions.save' | translate"
                  icon="pi pi-save"
                  type="submit"
                  [loading]="savingHousehold()"
                  [disabled]="householdForm.pristine || savingHousehold()"
                />
                @if (saved()) {
                  <p-message
                    severity="success"
                    [text]="'common.status.savedSuccessfully' | translate"
                  />
                }
              </div>
            </form>
          </p-card>

          <p-card
            [header]="'features.household.sections.guardians' | translate"
            styleClass="min-w-0"
          >
            <form
              [formGroup]="guardianForm"
              (ngSubmit)="addGuardian()"
              class="flex flex-col gap-3 mb-6"
            >
              <label for="guardianEmail" class="font-semibold">
                {{ 'features.household.form.guardianEmail.label' | translate }}
              </label>
              <div class="flex flex-col sm:flex-row gap-3">
                <input
                  pInputText
                  id="guardianEmail"
                  type="email"
                  formControlName="email"
                  class="w-full"
                />
                <p-button
                  [label]="'features.household.actions.addGuardian' | translate"
                  icon="pi pi-plus"
                  type="submit"
                  [loading]="addingGuardian()"
                  [disabled]="guardianForm.invalid || addingGuardian()"
                />
              </div>
            </form>

            @if (household()?.guardians?.length) {
              <div class="flex flex-col gap-3">
                @for (guardian of household()!.guardians; track guardian.email) {
                  <div
                    class="flex min-w-0 flex-col gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded-lg"
                  >
                    <div class="min-w-0 max-w-full">
                      <div class="font-semibold truncate">{{ displayName(guardian) }}</div>
                      <div class="text-sm text-surface-600 dark:text-surface-300 truncate">
                        {{ guardian.email }}
                      </div>
                      <div class="flex flex-wrap gap-2 mt-2">
                        <p-tag
                          [value]="contactTypeLabel(guardian.contactType)"
                          [severity]="guardian.pending ? 'warn' : 'secondary'"
                        />
                      </div>
                    </div>

                    <div class="flex min-w-0 flex-col sm:flex-row sm:flex-wrap items-stretch gap-2">
                      @if (canSetPrimary(guardian)) {
                        <p-button
                          [label]="'features.household.actions.setPrimary' | translate"
                          icon="pi pi-user"
                          severity="secondary"
                          size="small"
                          styleClass="w-full sm:w-auto justify-center"
                          (click)="setContactType(guardian.email, 'PRIMARY')"
                        />
                      }
                      @if (canSetSecondary(guardian)) {
                        <p-button
                          [label]="'features.household.actions.setSecondary' | translate"
                          icon="pi pi-user-plus"
                          severity="secondary"
                          size="small"
                          styleClass="w-full sm:w-auto justify-center"
                          (click)="setContactType(guardian.email, 'SECONDARY')"
                        />
                      }
                      <p-button
                        icon="pi pi-trash"
                        severity="danger"
                        [rounded]="true"
                        [text]="true"
                        size="small"
                        styleClass="self-start sm:self-center"
                        (click)="removeGuardian(guardian.email)"
                        [disabled]="guardian.currentUser || guardian.contactType === 'PRIMARY'"
                        [attr.aria-label]="'common.actions.remove' | translate"
                      />
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p-message
                severity="info"
                [text]="'features.household.empty.guardians' | translate"
              />
            }
          </p-card>
        </div>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly householdService = inject(HouseholdService);
  private readonly translate = inject(TranslateService);

  protected readonly household = signal<HouseholdDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly savingHousehold = signal(false);
  protected readonly addingGuardian = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saved = signal(false);

  protected readonly householdForm = this.fb.group({
    streetAndNumber: [''],
    plz: [''],
    place: [''],
  });

  protected readonly guardianForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async ngOnInit(): Promise<void> {
    await this.loadHousehold();
  }

  protected async saveHousehold(): Promise<void> {
    if (this.householdForm.invalid) return;

    this.savingHousehold.set(true);
    this.error.set(null);
    try {
      const value = this.householdForm.getRawValue();
      const household = await firstValueFrom(
        this.householdService.update({
          streetAndNumber: value.streetAndNumber || null,
          plz: value.plz || null,
          place: value.place || null,
        }),
      );
      this.setHousehold(household);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    } catch (err) {
      console.error('Failed to save household', err);
      this.error.set(this.t('features.household.messages.saveError'));
    } finally {
      this.savingHousehold.set(false);
    }
  }

  protected async addGuardian(): Promise<void> {
    if (this.guardianForm.invalid) return;

    this.addingGuardian.set(true);
    this.error.set(null);
    try {
      const email = this.guardianForm.getRawValue().email ?? '';
      const household = await firstValueFrom(this.householdService.addGuardian({ email }));
      this.setHousehold(household);
      this.guardianForm.reset();
    } catch (err) {
      console.error('Failed to add guardian', err);
      this.error.set(this.t('features.household.messages.addGuardianError'));
    } finally {
      this.addingGuardian.set(false);
    }
  }

  protected async removeGuardian(email: string): Promise<void> {
    this.error.set(null);
    try {
      const household = await firstValueFrom(this.householdService.removeGuardian(email));
      this.setHousehold(household);
    } catch (err) {
      console.error('Failed to remove guardian', err);
      this.error.set(this.t('features.household.messages.removeGuardianError'));
    }
  }

  protected async setContactType(
    email: string,
    contactType: Extract<HouseholdGuardianContactType, 'PRIMARY' | 'SECONDARY'>,
  ): Promise<void> {
    this.error.set(null);
    try {
      const household = await firstValueFrom(
        this.householdService.updateGuardianContactType(email, { contactType }),
      );
      this.setHousehold(household);
    } catch (err) {
      console.error('Failed to update guardian contact type', err);
      this.error.set(this.t('features.household.messages.contactTypeError'));
    }
  }

  protected displayName(guardian: HouseholdGuardianDto): string {
    const name = `${guardian.firstName ?? ''} ${guardian.lastName ?? ''}`.trim();
    return name || guardian.username || guardian.email;
  }

  protected contactTypeLabel(contactType: HouseholdGuardianContactType): string {
    return this.t(`features.household.contactTypes.${contactType.toLowerCase()}`);
  }

  protected canSetPrimary(guardian: HouseholdGuardianDto): boolean {
    return !guardian.pending && guardian.contactType !== 'PRIMARY';
  }

  protected canSetSecondary(guardian: HouseholdGuardianDto): boolean {
    return (
      !guardian.pending &&
      guardian.contactType !== 'PRIMARY' &&
      guardian.contactType !== 'SECONDARY'
    );
  }

  private async loadHousehold(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.setHousehold(await firstValueFrom(this.householdService.get()));
    } catch (err) {
      console.error('Failed to load household', err);
      this.error.set(this.t('features.household.messages.loadError'));
    } finally {
      this.loading.set(false);
    }
  }

  private setHousehold(household: HouseholdDto): void {
    this.household.set(household);
    this.householdForm.patchValue({
      streetAndNumber: household.streetAndNumber ?? '',
      plz: household.plz ?? '',
      place: household.place ?? '',
    });
    this.householdForm.markAsPristine();
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
