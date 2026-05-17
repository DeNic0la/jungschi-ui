import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-impressum',
  imports: [TranslatePipe],
  template: `
    <section class="py-20 px-8 max-w-4xl mx-auto">
      <h1 class="text-4xl font-extrabold mb-8 text-surface-900 dark:text-surface-0">
        {{ 'legal.impressum.title' | translate }}
      </h1>

      <div class="space-y-8 text-surface-600 dark:text-surface-400">
        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">
            {{ 'legal.impressum.contactAddress' | translate }}
          </h2>
          <p>Nicola Maria Fioretti</p>
          <p>Geissensteinring 38</p>
          <p>6005 Luzern</p>
          <p>Schweiz</p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">
            {{ 'common.fields.email' | translate }}
          </h2>
          <p>jungschi-page&#64;denic0la.ch</p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">
            {{ 'legal.impressum.disclaimer.title' | translate }}
          </h2>
          <p>
            {{ 'legal.impressum.disclaimer.paragraph1' | translate }}
          </p>
          <p>
            {{ 'legal.impressum.disclaimer.paragraph2' | translate }}
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">
            {{ 'legal.impressum.linkLiability.title' | translate }}
          </h2>
          <p>
            {{ 'legal.impressum.linkLiability.paragraph' | translate }}
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">
            {{ 'legal.impressum.copyright.title' | translate }}
          </h2>
          <p>
            {{ 'legal.impressum.copyright.paragraph' | translate }}
          </p>
        </div>
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
export class ImpressumComponent {}
