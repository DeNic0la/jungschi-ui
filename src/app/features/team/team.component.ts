import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-team',
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <h1 class="text-3xl font-bold mb-4">Jungschiteam</h1>
      <p class="mb-8">Willkommen auf der Team-Seite!</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <a routerLink="/team/health-data"
           class="flex flex-col items-center gap-4 p-8 bg-surface-50 dark:bg-surface-800 rounded-lg no-underline transition-all hover:-translate-y-1 hover:bg-surface-100 dark:hover:bg-surface-700 group border border-surface-200 dark:border-surface-700">
          <i class="pi pi-heart text-5xl text-primary transition-colors group-hover:scale-110"></i>
          <span class="font-semibold text-lg text-surface-900 dark:text-surface-0">Gesundheitsdaten</span>
        </a>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent {}
