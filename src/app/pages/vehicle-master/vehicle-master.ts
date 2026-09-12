import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Vehicle } from '../../model/vehicle.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IApiResponse } from '../../model/common.model';
import { Master } from '../../services/master';
import { SwalService } from '../../services/swal.service';
import { environment } from '../../../environments/environment';

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

  swal = inject(SwalService);

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.clearForm();
    this.master.getAllVehicles().subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.vehicleList.set(response.data as Vehicle[]);
          this.currentPage.set(1);
        } else {
          this.swal.error('Error al cargar vehículos', response.message);
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
        `${environment.apiUrl}/CreateNewCar`,
        this.vehicleObject,
      )
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            this.swal.success('Vehículo guardado', 'Los datos del vehículo se guardaron correctamente.');
            this.getAll();
          } else {
            this.swal.error('Error al guardar vehículo', response.message);
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
      this.swal.error('Vehículo no encontrado', 'No fue posible localizar el vehículo para editar.');
    }
  }

  onUpdate() {
    this.http
      .put<IApiResponse>(
        `${environment.apiUrl}/UpdateCar`,
        this.vehicleObject,
      )
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            this.swal.success('Vehículo actualizado', 'Los cambios se guardaron correctamente.');
            this.getAll();
          } else {
            this.swal.error('Error al actualizar vehículo', response.message);
          }
        },
        error: (error: any) => {
          console.error('Error updating vehicle:', error);
        },
      });
  }

  onDestroy(carId: number) {
    this.swal
      .confirm('Eliminar vehículo', '¿Estás seguro de eliminar este vehículo?')
      .then((result) => {
        if (!result.isConfirmed) {
          return;
        }

        this.http
          .delete<IApiResponse>(
            `${environment.apiUrl}/DeleteCarbyCarId?carid=${carId}`,
          )
          .subscribe({
            next: (response: IApiResponse) => {
              if (response.result) {
                this.swal.success('Vehículo eliminado', 'El vehículo fue eliminado correctamente.');
                this.getAll();
              } else {
                this.swal.error('Error al eliminar vehículo', response.message);
              }
            },
            error: (error: any) => {
              console.error('Error deleting vehicle:', error);
            },
          });
      });
  }

  clearForm() {
    this.vehicleObject = new Vehicle();
  }
}
