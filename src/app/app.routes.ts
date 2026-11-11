import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'flotta', loadComponent: () => import('./pages/fleet/fleet').then(m => m.Fleet) },
  { path: 'flotta/:id', loadComponent: () => import('./pages/boat-detail/boat-detail').then(m => m.BoatDetail) },
  { path: 'esperienze', loadComponent: () => import('./pages/experiences/experiences').then(m => m.Experiences) },
  { path: 'destinazioni', loadComponent: () => import('./pages/destinations/destinations').then(m => m.Destinations) },
  { path: 'contatti', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: '**', redirectTo: '' }
];