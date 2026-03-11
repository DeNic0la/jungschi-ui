import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { STATSIG_INIT_CONFIG } from '@statsig/angular-bindings';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { routes } from './app.routes';


const StatsigConfig = {
  sdkKey: "client-GmvqYVSPkAuEhQg5ktIz8QH1bQ4cucBg2JG23g0DIMJ",
  user: {userID: 'annonymous'}, // initial user object
  options: {disableCompression: true,plugins: [StatsigSessionReplayPlugin, StatsigAutoCapturePlugin]}
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: STATSIG_INIT_CONFIG,
      useValue: StatsigConfig,
    },
  ]
};
