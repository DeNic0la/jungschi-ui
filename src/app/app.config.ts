import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
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
    disableCompression: true,
    plugins: [StatsigSessionReplayPlugin, StatsigAutoCapturePlugin],
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        flow: 'standard',
        pkceMethod: 'S256',
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
    provideRouter(routes),
    {
      provide: STATSIG_INIT_CONFIG,
      useValue: StatsigConfig,
    },
  ],
};
