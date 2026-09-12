import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./pages/vehicle-master/vehicle-master').then((m) => m.VehicleMaster),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/booking/booking').then((m) => m.Booking),
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/customer-listing/customer-listing').then((m) => m.CustomerListing),
      },
    ],
  },
];