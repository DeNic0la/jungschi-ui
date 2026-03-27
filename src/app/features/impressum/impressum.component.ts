import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-impressum',
  imports: [],
  template: `
    <section class="py-20 px-8 max-w-4xl mx-auto">
      <h1 class="text-4xl font-extrabold mb-8 text-surface-900 dark:text-surface-0">Impressum</h1>

      <div class="space-y-8 text-surface-600 dark:text-surface-400">
        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">Kontaktadresse</h2>
          <p>Nicola Maria Fioretti</p>
          <p>Geissensteinring 38</p>
          <p>6005 Luzern</p>
          <p>Schweiz</p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">E-Mail</h2>
          <p>jungschi-page&#64;denic0la.ch</p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">Haftungsausschluss</h2>
          <p>
            Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit,
            Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
          </p>
          <p>
            Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art,
            welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten
            Informationen, durch Missbrauch der Verbindung oder durch technische Störungen
            entstanden sind, werden ausgeschlossen.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">
            Haftung für Links
          </h2>
          <p>
            Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
            Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt.
            Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers
            oder der Nutzerin.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">Urheberrechte</h2>
          <p>
            Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf
            dieser Website, gehören ausschliesslich der Jungschar der Markuskirche Luzern oder den speziell genannten
            Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung
            der Urheberrechtsträger im Voraus einzuholen.
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
