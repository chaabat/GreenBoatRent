import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'flotta', loadComponent: () => import('./pages/fleet/fleet').then(m => m.Fleet) },
  { path: 'flotta/:id', loadComponent: () => import('./pages/boat-detail/boat-detail').then(m => m.BoatDetail) },
  { path: 'esperienze', loadComponent: () => import('./pages/experiences/experiences').then(m => m.Experiences) },
  { path: 'destinazioni', loadComponent: () => import('./pages/destinations/destinations').then(m => m.Destinations) },
  { path: 'contatti', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },

  { path: 'admin/login', loadComponent: () => import('./pages/admin/login/login').then(m => m.Login) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'barche', loadComponent: () => import('./pages/admin/boats/admin-boats').then(m => m.AdminBoats) },
      { path: 'impostazioni', loadComponent: () => import('./pages/admin/settings/admin-settings').then(m => m.AdminSettings) }
    ]
  },

  { path: '**', redirectTo: '' }
];