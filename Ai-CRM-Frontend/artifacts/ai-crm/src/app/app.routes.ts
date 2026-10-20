import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { roleHomeRedirectGuard } from './guards/role-redirect.guard';

export const routes: Routes = [

  // ── Landing page (publique) ───────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(
        (m) => m.LandingComponent
      )
  },

  // ── Signup (publique) ─────────────────────────────────────────────────────
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then(
        (m) => m.SignupComponent
      )
  },

  // ── CRM (protégé Keycloak) ────────────────────────────────────────────────
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'CLIENT'] },
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./pages/contacts/contacts.component').then(
            (m) => m.ContactsComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'CLIENT'] },
      },
      {
        path: 'mailbox',
        loadComponent: () =>
          import('./pages/mailbox/mailbox.component').then(
            (m) => m.MailboxComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'CLIENT'] },
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./pages/campaigns/campaigns.component').then(
            (m) => m.CampaignsComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT'] },
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users.component').then(
            (m) => m.UsersComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/clients/clients.component').then(
            (m) => m.ClientsComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER'] },
      },
      {
        path: 'deals',
        loadComponent: () =>
          import('./pages/deals/deals.component').then((m) => m.DealsComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'CLIENT'] },
      },
      {
        path: 'activities',
        loadComponent: () =>
          import('./pages/activities/activities.component').then(
            (m) => m.ActivitiesComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'CLIENT'] },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'CLIENT'] },
      },
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./shared/blank/blank.component').then((m) => m.BlankComponent),
        canActivate: [AuthGuard, roleHomeRedirectGuard],
      },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];