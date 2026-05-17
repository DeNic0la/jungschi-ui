import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { TeamComponent } from '../../features/team/team.component';
import de from '../../../../public/i18n/de.json';

describe('ngx-translate integration', () => {
  it('loads the German catalog from the public i18n path', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          loader: provideTranslateHttpLoader({
            prefix: '/i18n/',
            suffix: '.json',
          }),
        }),
      ],
    });

    const translate = TestBed.inject(TranslateService);
    const translationLoaded = firstValueFrom(translate.use('de'));

    TestBed.inject(HttpTestingController).expectOne('/i18n/de.json').flush(de);
    await translationLoaded;

    expect(translate.instant('app.auth.login')).toBe('Anmelden');
  });

  it('renders a standalone component with loaded translations', async () => {
    TestBed.configureTestingModule({
      imports: [TeamComponent],
      providers: [
        provideRouter([{ path: 'team/health-data', component: class {} }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          fallbackLang: 'de',
          loader: provideTranslateHttpLoader({
            prefix: '/i18n/',
            suffix: '.json',
          }),
        }),
      ],
    });

    const translate = TestBed.inject(TranslateService);
    const translationLoaded = firstValueFrom(translate.use('de'));
    TestBed.inject(HttpTestingController).expectOne('/i18n/de.json').flush(de);
    await translationLoaded;

    const fixture = TestBed.createComponent(TeamComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Jungschiteam');
    expect(fixture.nativeElement.textContent).toContain('Gesundheitsdaten');
  });

  it('falls back to German when the active language misses a key', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          fallbackLang: 'de',
        }),
      ],
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', de);
    translate.setTranslation('en', {});
    await firstValueFrom(translate.use('en'));

    expect(translate.instant('common.actions.save')).toBe('Speichern');
  });
});
