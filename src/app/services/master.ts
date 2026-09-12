import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IApiResponse } from '../model/common.model';
import { environment } from '../../environments/environment';

@Service()
export class Master {
  http = inject(HttpClient);

  getAllVehicles() {
    return this.http.get<IApiResponse>(`${environment.apiUrl}/GetCars`);
  }

  getAllCustomers() {
    return this.http.get<IApiResponse>(`${environment.apiUrl}/GetCustomers`);
  }
}
