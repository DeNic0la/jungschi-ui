import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Keycloak from 'keycloak-js';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Message } from 'primeng/message';
import { UserService } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, Button, InputText, Panel, Message],
  template: `
    <div class="profile-container">
      <p-panel header="Profil">
        @if (loading()) {
          <div class="flex justify-center p-4">
            <p-message severity="info" text="Profil wird geladen..." />
          </div>
        } @else if (error()) {
          <div class="flex justify-center p-4">
            <p-message severity="error" [text]="error()!" />
          </div>
        } @else {
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
            <div class="field">
              <label for="username">Benutzername</label>
              <input pInputText id="username" formControlName="username" readonly />
            </div>

            <div class="field">
              <label for="email">E-Mail</label>
              <input pInputText id="email" formControlName="email" type="email" />
            </div>

            <div class="field">
              <label for="firstName">Vorname</label>
              <input pInputText id="firstName" formControlName="firstName" />
            </div>

            <div class="field">
              <label for="lastName">Nachname</label>
              <input pInputText id="lastName" formControlName="lastName" />
            </div>

            <div class="field">
              <label for="phoneNumber">Telefonnummer</label>
              <input pInputText id="phoneNumber" formControlName="phoneNumber" type="tel" />
            </div>

            <div class="form-actions">
              <p-button label="Speichern" type="submit" [loading]="saving()" icon="pi pi-save" />
              <p-button
                label="Passwort ändern"
                type="button"
                severity="secondary"
                icon="pi pi-key"
                (click)="changePassword()" />
              <p-button
                label="Account verwalten"
                type="button"
                severity="info"
                icon="pi pi-external-link"
                (click)="manageAccount()" />
            </div>
          </form>
        }
      </p-panel>
    </div>
  `,
  styles: `
    .profile-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field label {
      font-weight: 600;
      color: var(--p-text-color);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    input[readonly] {
      background-color: var(--p-surface-100);
      cursor: not-allowed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly keycloak = inject(Keycloak);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  protected readonly profileForm = this.fb.group({
    username: [{ value: '', disabled: true }],
    email: ['', [Validators.required, Validators.email]],
    firstName: [''],
    lastName: [''],
    phoneNumber: [''],
  });

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const profile = await firstValueFrom(this.userService.getUserProfile());
      this.profileForm.patchValue({
        username: profile.username ?? '',
        email: profile.email ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phoneNumber: profile.phoneNumber ?? '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      this.error.set('Profil konnte nicht geladen werden.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;

    this.saving.set(true);
    try {
      const formValue = this.profileForm.getRawValue();
      const update = {
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber,
      };
      await firstValueFrom(this.userService.updateUserProfile(update));
    } catch (err) {
      console.error('Failed to update profile:', err);
      this.error.set('Aktion fehlgeschlagen.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async changePassword(): Promise<void> {
    try {
      await this.keycloak.login({
        action: 'UPDATE_PASSWORD',
      });
    } catch (err) {
      console.error('Failed to trigger password update:', err);
      this.error.set('Passwortänderung fehlgeschlagen.');
    }
  }

  protected async manageAccount(): Promise<void> {
    try {
      await this.keycloak.accountManagement();
    } catch (err) {
      console.error('Failed to redirect to account management:', err);
      this.error.set('Account-Verwaltung konnte nicht geöffnet werden.');
    }
  }
}
