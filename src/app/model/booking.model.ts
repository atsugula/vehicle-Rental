export class Booking {
  bookingId: number;
  bookingUid: string;
  customerName: string;
  customerCity: string;
  mobileNo: string;
  email: string;
  carId: number;
  bookingDate: string;
  discount: number;
  totalBillAmount: number;
  brand: string;
  model: string;
  custId: number;

  constructor() {
    this.bookingId = 0;
    this.bookingUid = '';
    this.customerName = '';
    this.customerCity = '';
    this.mobileNo = '';
    this.email = '';
    this.carId = 0;
    this.bookingDate = '';
    this.discount = 0;
    this.totalBillAmount = 0;
    this.brand = '';
    this.model = '';
    this.custId = 0;
  }
}