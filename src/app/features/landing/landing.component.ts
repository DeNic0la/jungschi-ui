import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-landing-page',
  imports: [Button, Card, TranslatePipe],
  template: `
    <section class="py-20 px-8 text-center bg-primary-50 dark:bg-surface-950 transition-colors">
      <div class="max-w-5xl mx-auto">
        <h1
          class="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight text-surface-900 dark:text-surface-0"
        >
          {{ 'features.landing.hero.title' | translate }}
        </h1>
        <p
          class="text-lg sm:text-xl text-surface-600 dark:text-surface-400 mb-10 max-w-2xl mx-auto"
        >
          {{ 'features.landing.hero.body' | translate }}
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <p-button
            [label]="'features.landing.hero.learnMore' | translate"
            size="large"
            (click)="scrollToFeatures()"
          />
        </div>
      </div>
    </section>

    <section id="features" class="py-16 px-8 max-w-7xl mx-auto">
      <h2
        class="text-3xl sm:text-4xl font-bold text-center mb-12 text-surface-900 dark:text-surface-0"
      >
        {{ 'features.landing.features.title' | translate }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (feature of features(); track feature.titleKey) {
          <p-card [header]="feature.titleKey | translate" class="h-full">
            <p class="m-0 text-surface-600 dark:text-surface-400">
              {{ feature.descriptionKey | translate }}
            </p>
          </p-card>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  protected readonly features = signal([
    {
      titleKey: 'features.landing.features.centralManagement.title',
      descriptionKey: 'features.landing.features.centralManagement.description',
    },
    {
      titleKey: 'features.landing.features.noPaperwork.title',
      descriptionKey: 'features.landing.features.noPaperwork.description',
    },
    {
      titleKey: 'features.landing.features.secureCurrent.title',
      descriptionKey: 'features.landing.features.secureCurrent.description',
    },
  ]);

  protected readonly currentYear = new Date().getFullYear();

  protected scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
