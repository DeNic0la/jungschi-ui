import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { pendingChangesGuard } from './pending-changes.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then((m) => m.LandingPageComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'participants',
    loadComponent: () =>
      import('./participant/participant.component').then((m) => m.ParticipantComponent),
    canActivate: [authGuard],
  },
  {
    path: 'participants/:id',
    loadComponent: () =>
      import('./participant-detail/participant-detail.component').then(
        (m) => m.ParticipantDetailComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./participant-detail/subpages/overview.component').then(
            (m) => m.ParticipantOverviewComponent
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'health-stats',
        loadComponent: () =>
          import('./participant-detail/subpages/health-stats.component').then(
            (m) => m.HealthStatsComponent
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'camp-stats',
        loadComponent: () =>
          import('./participant-detail/subpages/camp-stats.component').then(
            (m) => m.CampStatsComponent
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'allergy',
        loadComponent: () =>
          import('./participant-detail/subpages/allergy.component').then(
            (m) => m.AllergyComponent
          ),
        canDeactivate: [pendingChangesGuard],
      },
    ],
  },
];
