import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { DashboardData } from '../../model/dashboard.model';
import { IApiResponse } from '../../model/common.model';
import { Booking } from '../../model/booking.model';

@Component({
  imports: [DecimalPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  apiUrl = 'https://freeapi.gerasim.in/api/CarRentalApp';

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

  http = inject(HttpClient);

  ngOnInit(): void {
    this.getDashboardData();
    this.getAllBookings();
  }

  getDashboardData() {
    this.http.get<IApiResponse>(`${this.apiUrl}/GetDashboardData`).subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          const data = Array.isArray(response.data) ? response.data[0] : response.data;
          this.dashboard.set(data as DashboardData);
        } else {
          alert('Failed to fetch dashboard data: ' + response.message);
        }
      },
      error: (error: any) => {
        console.error('Error fetching dashboard data:', error);
      },
    });
  }

  getAllBookings() {
    this.http.get<IApiResponse>(`${this.apiUrl}/geAllBookings`).subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.bookingList.set(response.data as Booking[]);
        } else {
          alert('Failed to fetch bookings: ' + response.message);
        }
      },
      error: (error: any) => {
        console.error('Error fetching bookings:', error);
      },
    });
  }
}