import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../model/customer.model';
import { IApiResponse } from '../../model/common.model';
import { SwalService } from '../../services/swal.service';
import { environment } from '../../../environments/environment';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-customer-listing',
  styleUrl: './customer-listing.css',
  templateUrl: './customer-listing.html',
})
export class CustomerListing implements OnInit {
  apiUrl = environment.apiUrl;

  customerForm: FormGroup;
  customerList = signal<Customer[]>([]);

  isLoading = signal(true);

  private currentCustomerId = 0;

  // Paginador de la tabla de clientes
  pageSize = signal(4);
  currentPage = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.customerList().length / this.pageSize())));

  pagedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.customerList().slice(start, start + this.pageSize());
  });

  startIndex = computed(() =>
    this.customerList().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );

  endIndex = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.customerList().length),
  );

  get customerObject(): Customer {
    return {
      ...this.customerForm.value,
      customerId: this.currentCustomerId,
    };
  }

  http = inject(HttpClient);
  fb = inject(FormBuilder);

  swal = inject(SwalService);

  constructor() {
    this.customerForm = this.fb.group({
      customerName: [''],
      customerCity: [''],
      mobileNo: [''],
      email: [''],
    });
  }

  ngOnInit(): void {
    this.getAllCustomers();
  }

  getAllCustomers() {
    this.clearForm();
    this.http.get<IApiResponse>(`${this.apiUrl}/GetCustomers`).subscribe({
      next: (response: IApiResponse) => {
        if (response.result) {
          this.customerList.set(response.data as Customer[]);
          this.currentPage.set(1);
          this.isLoading.set(false);
        } else {
          this.isLoading.set(false);
          this.swal.error('Error al cargar clientes', response.message);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error fetching customers:', error);
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
    const customer = this.customerObject;
    const mobileNo = this.sanitizeMobileNo(customer.mobileNo);
    if (mobileNo.length !== 10) {
      this.swal.warning('Número de teléfono inválido', 'El número de móvil debe tener exactamente 10 dígitos.');
      return;
    }

    this.http
      .post<IApiResponse>(`${this.apiUrl}/CreateNewCustomer`, {
        customerName: customer.customerName,
        customerCity: customer.customerCity,
        mobileNo: mobileNo,
        email: customer.email,
      })
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            this.swal.success('Cliente guardado', 'El cliente se registró correctamente.');
            this.getAllCustomers();
          } else {
            this.swal.error('Error al guardar cliente', response.message);
          }
        },
        error: (error: any) => {
          console.error('Error saving customer:', error);
        },
      });
  }

  onEdit(customerId: number) {
    const customerToEdit = this.customerList().find((customer) => customer.customerId === customerId);
    if (customerToEdit) {
      this.currentCustomerId = customerToEdit.customerId;
      this.customerForm.patchValue({
        customerName: customerToEdit.customerName,
        customerCity: customerToEdit.customerCity,
        mobileNo: customerToEdit.mobileNo,
        email: customerToEdit.email,
      });
    } else {
      this.swal.error('Cliente no encontrado', 'No fue posible localizar al cliente para editar.');
    }
  }

  onUpdate() {
    const customer = this.customerObject;
    const mobileNo = this.sanitizeMobileNo(customer.mobileNo);
    if (mobileNo.length !== 10) {
      this.swal.warning('Número de teléfono inválido', 'El número de móvil debe tener exactamente 10 dígitos.');
      return;
    }

    this.http
      .put<IApiResponse>(`${this.apiUrl}/UpdateCustomer`, {
        customerId: customer.customerId,
        customerName: customer.customerName,
        customerCity: customer.customerCity,
        mobileNo: mobileNo,
        email: customer.email,
      })
      .subscribe({
        next: (response: IApiResponse) => {
          if (response.result) {
            this.swal.success('Cliente actualizado', 'Los cambios se guardaron correctamente.');
            this.getAllCustomers();
          } else {
            this.swal.error('Error al actualizar cliente', response.message);
          }
        },
        error: (error: any) => {
          console.error('Error updating customer:', error);
        },
      });
  }

  onDestroy(customerId: number) {
    this.swal
      .confirm('Eliminar cliente', '¿Estás seguro de eliminar este cliente?')
      .then((result) => {
        if (!result.isConfirmed) {
          return;
        }

        this.http
          .delete<IApiResponse>(`${this.apiUrl}/DeletCustomerById?id=${customerId}`)
          .subscribe({
            next: (response: IApiResponse) => {
              if (response.result) {
                this.swal.success('Cliente eliminado', 'El cliente fue eliminado correctamente.');
                this.getAllCustomers();
              } else {
                this.swal.error('Error al eliminar cliente', response.message);
              }
            },
            error: (error: any) => {
              console.error('Error deleting customer:', error);
            },
          });
      });
  }

  clearForm() {
    this.currentCustomerId = 0;
    this.customerForm.reset({
      customerName: '',
      customerCity: '',
      mobileNo: '',
      email: '',
    });
  }

  private sanitizeMobileNo(value: string): string {
    return (value || '').replace(/\D/g, '');
  }
}