import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Booking as BookingModel } from '../../model/booking.model';
import { Vehicle } from '../../model/vehicle.model';
import { IApiResponse } from '../../model/common.model';
import { Master } from '../../services/master';
import { SwalService } from '../../services/swal.service';
import { environment } from '../../../environments/environment';

@Component({
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  selector: 'app-booking',
  styleUrl: './booking.css',
  templateUrl: './booking.html',
})
export class Booking implements OnInit {
  apiUrl = environment.apiUrl;
  master = inject(Master);

  swal = inject(SwalService);

  bookingForm: FormGroup;
  bookingList = signal<BookingModel[]>([]);
  vehicleList = signal<Vehicle[]>([]);

  private currentBookingId = 0;

  // Paginador de la tabla de reservas
  pageSize = signal(4);
  currentPage = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.bookingList().length / this.pageSize())));

  pagedBookings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.bookingList().slice(start, start + this.pageSize());
  });

  startIndex = computed(() =>
    this.bookingList().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );

  endIndex = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.bookingList().length),
  );

  get bookingObject(): BookingModel {
    return {
      ...this.bookingForm.value,
      bookingId: this.currentBookingId,
    };
  }

  http = inject(HttpClient);
  fb = inject(FormBuilder);

  constructor() {
    this.bookingForm = this.fb.group({
      customerName: [''],
      customerCity: [''],
      mobileNo: [''],
      email: [''],
      carId: [0],
      bookingDate: [''],
      discount: [0],
      totalBillAmount: [0],
    });
  }

  ngOnInit(): void {
    this.getAllBookings();
    this.getAllCars();
  }

  getAllBookings() {
    this.clearForm();
    this.http.get<IApiResponse>(`${this.apiUrl}/geAllBookings`).subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.bookingList.set(response.data as BookingModel[]);
          this.currentPage.set(1);
        } else {
          this.swal.error('Error al cargar reservas', response.message);
        }
      },
      error: (error: any) => {
        console.error('Error fetching bookings:', error);
      },
    });
  }

  getAllCars() {
    this.master.getAllVehicles().subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.vehicleList.set(response.data as Vehicle[]);
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
    const booking = this.bookingObject;
    const mobileNo = (booking.mobileNo || '').replace(/\D/g, '');
    if (mobileNo.length !== 10) {
      this.swal.warning('Número de teléfono inválido', 'El número de móvil debe tener exactamente 10 dígitos.');
      return;
    }

    this.http
      .post<IApiResponse>(`${this.apiUrl}/CreateNewBooking`, {
        customerName: booking.customerName,
        customerCity: booking.customerCity,
        mobileNo: mobileNo,
        email: booking.email,
        bookingId: booking.bookingId,
        carId: Number(booking.carId),
        bookingDate: booking.bookingDate,
        discount: Number(booking.discount) || 0,
        totalBillAmount: Number(booking.totalBillAmount) || 0,
      })
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            this.swal.success('Reserva guardada', 'La reserva se registró correctamente.');
            this.getAllBookings();
          } else {
            this.swal.error('Error al guardar reserva', response.message);
          }
        },
        error: (error: any) => {
          console.error('Error saving booking:', error);
        },
      });
  }

  onEdit(bookingId: number) {
    this.http
      .get<IApiResponse>(`${this.apiUrl}/GetBookingByBookingId?bookingId=${bookingId}`)
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            const booking = response.data as BookingModel;
            this.currentBookingId = booking.bookingId;
            this.bookingForm.patchValue({
              customerName: booking.customerName,
              customerCity: booking.customerCity,
              mobileNo: booking.mobileNo,
              email: booking.email,
              carId: booking.carId,
              bookingDate: this.toDateInputValue(booking.bookingDate),
              discount: booking.discount,
              totalBillAmount: booking.totalBillAmount,
            });
          } else {
            this.swal.error('Error al cargar reserva', response.message);
          }
        },
        error: (error: any) => {
          console.error('Error loading booking:', error);
        },
      });
  }

  onUpdate() {
    this.bookingList.update((list) =>
      list.map((booking) =>
        booking.bookingId === this.currentBookingId ? this.bookingObject : booking,
      ),
    );
    this.swal.success('Reserva actualizada', 'La reserva se actualizó correctamente.');
    this.clearForm();
  }

  onDestroy(bookingId: number) {
    this.swal
      .confirm('Eliminar reserva', '¿Estás seguro de eliminar esta reserva?')
      .then((result) => {
        if (!result.isConfirmed) {
          return;
        }

        this.http.delete<IApiResponse>(`${this.apiUrl}/DeletBookingById?id=${bookingId}`).subscribe({
          next: (response: IApiResponse) => {
            if (response.result) {
              this.swal.success('Reserva eliminada', 'La reserva fue eliminada correctamente.');
              this.getAllBookings();
            } else {
              this.swal.error('Error al eliminar reserva', response.message);
            }
          },
          error: (error: any) => {
            console.error('Error deleting booking:', error);
          },
        });
      });
  }

  clearForm() {
    this.currentBookingId = 0;
    this.bookingForm.reset({
      customerName: '',
      customerCity: '',
      mobileNo: '',
      email: '',
      carId: 0,
      bookingDate: '',
      discount: 0,
      totalBillAmount: 0,
    });
  }

  private toDateInputValue(value: string): string {
    return value ? value.split('T')[0] : '';
  }
}
