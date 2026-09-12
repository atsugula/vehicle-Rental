import { Service } from '@angular/core';
import Swal from 'sweetalert2';

@Service()
export class SwalService {
  private readonly palette = {
    brand: '#24468A',
    brandDark: '#1B3568',
    accent: '#FF6B1A',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
    error: '#DC2626',
  };

  success(title: string, message?: string) {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: this.palette.brand,
      confirmButtonText: 'Aceptar',
      iconColor: this.palette.success,
      buttonsStyling: true,
    });
  }

  error(title: string, message?: string) {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: this.palette.brand,
      confirmButtonText: 'Cerrar',
      iconColor: this.palette.error,
      buttonsStyling: true,
    });
  }

  warning(title: string, message?: string) {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonColor: this.palette.brand,
      confirmButtonText: 'Entendido',
      iconColor: this.palette.warning,
      buttonsStyling: true,
    });
  }

  info(title: string, message?: string) {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonColor: this.palette.brand,
      confirmButtonText: 'Aceptar',
      buttonsStyling: true,
    });
  }

  confirm(title: string, message?: string) {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: this.palette.accent,
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      iconColor: this.palette.warning,
      focusCancel: true,
      buttonsStyling: true,
    });
  }
}