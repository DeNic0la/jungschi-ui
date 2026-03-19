import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { STATSIG_INIT_CONFIG } from '@statsig/angular-bindings';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';

const StatsigConfig = {
  sdkKey: environment.statsig.sdkKey,
  user: { userID: 'annonymous' }, // initial user object
  options: {
    disableCompression: false,
    plugins: [new StatsigSessionReplayPlugin(), new StatsigAutoCapturePlugin()],
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'system',
        },
      },
    }),
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        adapter: 'cordova',
        checkLoginIframe: true,
      },
      features: [withAutoRefreshToken()],
      providers: [
        AutoRefreshTokenService,
        UserActivityService,
        {
          provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
          useValue: [
            {
              urlPattern: /^\/api\/.*$/i,
              bearerPrefix: 'Bearer',
            },
          ],
        },
      ],
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    MessageService,
    ConfirmationService,
    {
      provide: STATSIG_INIT_CONFIG,
      useValue: StatsigConfig,
    },
  ],
};
