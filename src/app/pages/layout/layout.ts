import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  imports: [RouterOutlet, RouterLinkActive, RouterLink],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {

  currentUser: string | null = null;

  router = inject(Router);

  constructor() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser != null) {
      this.currentUser = currentUser;
    }
  }

  onLogout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

}
