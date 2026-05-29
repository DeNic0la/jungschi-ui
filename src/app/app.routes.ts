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
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'participants',
    loadComponent: () =>
      import('./features/participant/participant.component').then((m) => m.ParticipantComponent),
    canActivate: [authGuard],
  },
  {
    path: 'household',
    loadComponent: () =>
      import('./features/household/household.component').then((m) => m.HouseholdComponent),
    canActivate: [authGuard],
    data: { roles: ['guardian'] },
  },
  {
    path: 'camps',
    loadComponent: () => import('./features/camps/camps.component').then((m) => m.CampsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'camps/:campId/signup',
    loadComponent: () => import('./features/camps/signup.component').then((m) => m.SignupComponent),
    canActivate: [authGuard],
  },
  {
    path: 'team',
    loadComponent: () => import('./features/team/team.component').then((m) => m.TeamComponent),
    canActivate: [authGuard],
    data: { roles: ['Jungschiteam', 'ADMIN', 'Sanitaet'] },
  },
  {
    path: 'team/signups',
    loadComponent: () =>
      import('./features/team/camp-signups.component').then((m) => m.CampSignupsComponent),
    canActivate: [authGuard],
    data: { roles: ['Jungschiteam', 'ADMIN'] },
  },
  {
    path: 'team/room-management',
    loadComponent: () =>
      import('./features/team/room-management.component').then((m) => m.RoomManagementComponent),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'team/camp-management',
    loadComponent: () =>
      import('./features/team/camp-management.component').then((m) => m.CampManagementComponent),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'team/health-data',
    loadComponent: () =>
      import('./features/team/health-data.component').then((m) => m.HealthDataComponent),
    canActivate: [authGuard],
    data: { roles: ['Jungschiteam', 'ADMIN', 'Sanitaet'] },
  },
  {
    path: 'team/health-data/:id/details',
    loadComponent: () =>
      import('./features/team/participant-health-details.component').then(
        (m) => m.ParticipantHealthDetailsComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ['Jungschiteam', 'ADMIN', 'Sanitaet'] },
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
        path: 'general-data',
        loadComponent: () =>
          import('./features/participant-detail/subpages/camp-stats.component').then(
            (m) => m.CampStatsComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'camp-stats',
        redirectTo: 'general-data',
        pathMatch: 'full',
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
  {
    path: 'impressum',
    loadComponent: () =>
      import('./features/impressum/impressum.component').then((m) => m.ImpressumComponent),
  },
];
