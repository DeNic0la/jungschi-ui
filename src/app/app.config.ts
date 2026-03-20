import { providePrimeNG } from 'primeng/config';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService,
} from 'keycloak-angular';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import {definePreset} from '@primeuix/themes';

const AuroraPurple = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{purple.50}',
      100: '{purple.100}',
      200: '{purple.200}',
      300: '{purple.300}',
      400: '{purple.400}',
      500: '{purple.500}',
      600: '{purple.600}',
      700: '{purple.700}',
      800: '{purple.800}',
      900: '{purple.900}',
      950: '{purple.950}'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    providePrimeNG({
      theme: {
        preset: AuroraPurple,
        options: {
          darkModeSelector: 'system',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng'
          }
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
        //onLoad: 'check-sso',
        flow: 'standard',
        //silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
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
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    MessageService,
    ConfirmationService,
  ],
};
