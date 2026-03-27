import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { pendingChangesGuard } from './shared/guards/pending-changes.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingPageComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'participants',
    loadComponent: () =>
      import('./features/participant/participant.component').then((m) => m.ParticipantComponent),
    canActivate: [authGuard],
  },
  {
    path: 'team',
    loadComponent: () => import('./features/team/team.component').then((m) => m.TeamComponent),
    canActivate: [authGuard],
    data: { roles: ['Jungschiteam'] },
  },
  {
    path: 'team/health-data',
    loadComponent: () =>
      import('./features/team/health-data.component').then((m) => m.HealthDataComponent),
    canActivate: [authGuard],
    data: { roles: ['Jungschiteam'] },
  },
  {
    path: 'team/health-data/:id/details',
    loadComponent: () =>
      import('./features/team/participant-health-details.component').then(
        (m) => m.ParticipantHealthDetailsComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ['Jungschiteam'] },
  },
  {
    path: 'participants/:id',
    loadComponent: () =>
      import('./features/participant-detail/participant-detail.component').then(
        (m) => m.ParticipantDetailComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/participant-detail/subpages/overview.component').then(
            (m) => m.ParticipantOverviewComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'health-stats',
        loadComponent: () =>
          import('./features/participant-detail/subpages/health-stats.component').then(
            (m) => m.HealthStatsComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'camp-stats',
        loadComponent: () =>
          import('./features/participant-detail/subpages/camp-stats.component').then(
            (m) => m.CampStatsComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'allergy',
        loadComponent: () =>
          import('./features/participant-detail/subpages/allergy.component').then(
            (m) => m.AllergyComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
    ],
  },
];
