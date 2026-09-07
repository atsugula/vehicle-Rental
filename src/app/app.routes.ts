import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Layout } from './pages/layout/layout';
import { Booking } from './pages/booking/booking';
import { Dashboard } from './pages/dashboard/dashboard';
import { VehicleMaster } from './pages/vehicle-master/vehicle-master';
import { CustomerListing } from './pages/customer-listing/customer-listing';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'vehicles',
        component: VehicleMaster,
      },
      {
        path: 'bookings',
        component: Booking,
      },
      {
        path: 'customers',
        component: CustomerListing,
      },
    ],
  },
];
