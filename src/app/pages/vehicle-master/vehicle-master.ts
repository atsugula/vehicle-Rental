import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Vehicle } from '../../model/vehicle.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IApiResponse } from '../../model/common.model';
import { Master } from '../../services/master';

@Component({
  imports: [FormsModule],
  selector: 'app-vehicle-master',
  styleUrl: './vehicle-master.css',
  templateUrl: './vehicle-master.html',
})
export class VehicleMaster implements OnInit {
  vehicleObject: Vehicle = new Vehicle();
  vehicleList = signal<Vehicle[]>([]);

  // Paginador de la tabla de vehículos
  pageSize = signal(4);
  currentPage = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.vehicleList().length / this.pageSize())));

  pagedVehicles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.vehicleList().slice(start, start + this.pageSize());
  });

  startIndex = computed(() =>
    this.vehicleList().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );

  endIndex = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.vehicleList().length),
  );

  http = inject(HttpClient);

  master = inject(Master);

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.clearForm();
    this.master.getAll().subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.vehicleList.set(response.data as Vehicle[]);
          this.currentPage.set(1);
        } else {
          alert('Failed to fetch vehicles: ' + response.message);
        }
      },
      error: (error: any) => {
        console.error('Error fetching vehicles:', error);
      },
    });
  }

  goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  onSave() {
    this.http
      .post<IApiResponse>(
        'https://freeapi.gerasim.in/api/CarRentalApp/CreateNewCar',
        this.vehicleObject,
      )
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            alert('Vehicle saved successfully!');
            this.getAll();
          } else {
            alert('Failed to save vehicle: ' + response.message);
          }
        },
        error: (error: any) => {
          console.error('Error saving vehicle:', error);
        },
      });
  }

  onEdit(carId: number) {
    const vehicleToEdit = this.vehicleList().find((vehicle) => vehicle.carId === carId);
    if (vehicleToEdit) {
      this.vehicleObject = { ...vehicleToEdit };
    } else {
      alert('Vehicle not found for editing.');
    }
  }

  onUpdate() {
    this.http
      .put<IApiResponse>(
        'https://freeapi.gerasim.in/api/CarRentalApp/UpdateCar',
        this.vehicleObject,
      )
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            alert('Vehicle updated successfully!');
            this.getAll();
          } else {
            alert('Failed to update vehicle: ' + response.message);
          }
        },
        error: (error: any) => {
          console.error('Error updating vehicle:', error);
        },
      });
  }

  onDestroy(carId: number) {
    const confirmDelete = confirm('Are you sure you want to delete this vehicle?');
    if (!confirmDelete) {
      return; // User canceled the deletion
    }

    this.http
      .delete<IApiResponse>(
        `https://freeapi.gerasim.in/api/CarRentalApp/DeleteCarbyCarId?carid=${carId}`,
      )
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            alert('Vehicle deleted successfully!');
            this.getAll();
          } else {
            alert('Failed to delete vehicle: ' + response.message);
          }
        },
        error: (error: any) => {
          console.error('Error deleting vehicle:', error);
        },
      });
  }

  clearForm() {
    this.vehicleObject = new Vehicle();
  }
}
