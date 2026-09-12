import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IApiResponse } from '../model/common.model';

@Service()
export class Master {
  http = inject(HttpClient);

  getAllVehicles() {
    return this.http.get<IApiResponse>('https://freeapi.gerasim.in/api/CarRentalApp/GetCars');
  }

  getAllCustomers() {
    return this.http.get<IApiResponse>('https://freeapi.gerasim.in/api/CarRentalApp/GetCustomers');
  }
}
