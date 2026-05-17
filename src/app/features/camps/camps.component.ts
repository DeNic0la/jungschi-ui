import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { TranslatePipe } from '@ngx-translate/core';
import { CampDto } from '../../shared/models/camp.model';
import { CampService } from '../../shared/services/camp.service';

@Component({
  selector: 'app-camps',
  imports: [CommonModule, RouterLink, Button, Card, Message, Tag, TranslatePipe],
  template: `
    <div class="page-container">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          {{ 'features.camps.title' | translate }}
        </h1>
      </header>

      @if (loadError()) {
        <p-message severity="error" [text]="'features.camps.messages.loadError' | translate" />
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (camp of camps(); track camp.id) {
          <p-card>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 class="text-xl font-semibold m-0">{{ camp.title }}</h2>
                  <p class="text-sm text-surface-600 dark:text-surface-300 mt-2 mb-0">
                    {{ camp.startDate | date: 'dd.MM.yyyy' }} -
                    {{ camp.endDate | date: 'dd.MM.yyyy' }}
                  </p>
                </div>
                <p-tag
                  [severity]="hasStarted(camp) ? 'secondary' : 'success'"
                  [value]="
                    hasStarted(camp)
                      ? ('features.camps.status.started' | translate)
                      : ('features.camps.status.open' | translate)
                  "
                />
              </div>

              @if (camp.description) {
                <p class="text-surface-700 dark:text-surface-200 m-0">{{ camp.description }}</p>
              }

              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm m-0">
                <div>
                  <dt class="font-semibold text-surface-500">
                    {{ 'features.camps.fields.signupEndDate' | translate }}
                  </dt>
                  <dd class="m-0">{{ camp.signupEndDate | date: 'dd.MM.yyyy' }}</dd>
                </div>
                <div>
                  <dt class="font-semibold text-surface-500">
                    {{ 'features.camps.fields.priceFirst' | translate }}
                  </dt>
                  <dd class="m-0">{{ camp.priceFirst | currency: 'CHF' : 'symbol' : '1.0-2' }}</dd>
                </div>
              </dl>

              <div class="flex justify-end">
                <p-button
                  [label]="'features.camps.actions.signup' | translate"
                  icon="pi pi-send"
                  [routerLink]="['/camps', camp.id, 'signup']"
                  [disabled]="hasStarted(camp)"
                />
              </div>
            </div>
          </p-card>
        } @empty {
          <div class="col-span-full">
            <p-message severity="info" [text]="'features.camps.empty' | translate" />
          </div>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampsComponent {
  private readonly campService = inject(CampService);
  protected loadError = () => false;

  protected readonly camps = toSignal(
    this.campService.getAll().pipe(
      catchError(() => {
        this.loadError = () => true;
        return of([] as CampDto[]);
      }),
    ),
    { initialValue: [] as CampDto[] },
  );

  protected hasStarted(camp: CampDto): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${camp.startDate}T00:00:00`) <= today;
  }
}
