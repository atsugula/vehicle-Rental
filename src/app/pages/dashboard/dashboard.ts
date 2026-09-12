import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DashboardData } from '../../model/dashboard.model';
import { IApiResponse } from '../../model/common.model';
import { Booking } from '../../model/booking.model';
import { SwalService } from '../../services/swal.service';
import { environment } from '../../../environments/environment';
import { fromEvent, interval, merge, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  imports: [DecimalPipe, DatePipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit, OnDestroy {
  apiUrl = environment.apiUrl;

  dashboard = signal<DashboardData>({
    totalCars: 0,
    totalCustomers: 0,
    totalBookings: 0,
    todaysBooking: 0,
    todayTotalAmount: 0,
    totalAmount: 0,
  });

  bookingList = signal<Booking[]>([]);

  recentBookings = computed(() => this.bookingList().slice(0, 5));

  isLoading = signal(true);

  lastUpdated = signal<Date | null>(null);

  private realtimeSubscription?: Subscription;

  http = inject(HttpClient);

  swal = inject(SwalService);

  ngOnInit(): void {
    this.fetchAll();
    this.startRealtime();
  }

  ngOnDestroy(): void {
    this.realtimeSubscription?.unsubscribe();
  }

  startRealtime() {
    const visibility$ = fromEvent(document, 'visibilitychange').pipe(
      filter(() => document.visibilityState === 'visible'),
    );

    this.realtimeSubscription = merge(interval(5000), visibility$).subscribe(() => {
      this.fetchAll();
    });
  }

  fetchAll() {
    this.getDashboardData();
    this.getAllBookings();
  }

  refreshNow() {
    this.fetchAll();
  }

  getDashboardData() {
    this.http.get<IApiResponse>(`${this.apiUrl}/GetDashboardData`).subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          const data = Array.isArray(response.data) ? response.data[0] : response.data;
          this.dashboard.set(data as DashboardData);
          this.lastUpdated.set(new Date());
          this.isLoading.set(false);
        } else {
          this.isLoading.set(false);
          this.swal.error('Error al cargar la información del panel', response.message);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error fetching dashboard data:', error);
      },
    });
  }

  getAllBookings() {
    this.http.get<IApiResponse>(`${this.apiUrl}/geAllBookings`).subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.bookingList.set(response.data as Booking[]);
          this.lastUpdated.set(new Date());
        } else {
          this.swal.error('Error al cargar reservas', response.message);
        }
      },
      error: (error: any) => {
        console.error('Error fetching bookings:', error);
      },
    });
  }
}