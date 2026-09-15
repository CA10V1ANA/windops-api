import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'assets',
    loadComponent: () =>
      import('./assets-list/assets-list').then((m) => m.AssetsList),
  },
  {
    path: 'assets/:id',
    loadComponent: () =>
      import('./asset-detail/asset-detail').then((m) => m.AssetDetail),
  },
  {
    path: 'alerts',
    loadComponent: () =>
      import('./alerts/alerts').then((m) => m.AlertsComponent),
  }
];
