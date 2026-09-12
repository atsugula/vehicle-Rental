import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Booking as BookingModel } from '../../model/booking.model';
import { Vehicle } from '../../model/vehicle.model';
import { IApiResponse } from '../../model/common.model';

@Component({
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  selector: 'app-booking',
  styleUrl: './booking.css',
  templateUrl: './booking.html',
})
export class Booking implements OnInit {
  apiUrl = 'https://freeapi.gerasim.in/api/CarRentalApp';

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
          alert('Failed to fetch bookings: ' + response.message);
        }
      },
      error: (error: any) => {
        console.error('Error fetching bookings:', error);
      },
    });
  }

  getAllCars() {
    this.http.get<IApiResponse>(`${this.apiUrl}/GetCars`).subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.vehicleList.set(response.data as Vehicle[]);
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
    const booking = this.bookingObject;
    const mobileNo = (booking.mobileNo || '').replace(/\D/g, '');
    if (mobileNo.length !== 10) {
      alert('Mobile number must be exactly 10 digits.');
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
            alert('Booking saved successfully!');
            this.getAllBookings();
          } else {
            alert('Failed to save booking: ' + response.message);
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
            alert('Failed to load booking: ' + response.message);
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
    alert('Booking updated successfully!');
    this.clearForm();
  }

  onDestroy(bookingId: number) {
    const confirmDelete = confirm('Are you sure you want to delete this booking?');
    if (!confirmDelete) {
      return;
    }

    this.http
      .delete<IApiResponse>(`${this.apiUrl}/DeletBookingById?id=${bookingId}`)
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            alert('Booking deleted successfully!');
            this.getAllBookings();
          } else {
            alert('Failed to delete booking: ' + response.message);
          }
        },
        error: (error: any) => {
          console.error('Error deleting booking:', error);
        },
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