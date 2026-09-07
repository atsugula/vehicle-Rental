import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface LoginObj {
  userName: string;
  password: string;
}

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  loginObj: LoginObj = {
    userName: '',
    password: ''
  }

  users: LoginObj[] = [
    { userName: 'admin', password: 'admin' },
    { userName: 'user', password: 'user' }
  ];

  router = inject(Router);

  constructor() {}

  onLogin() {
    if (this.loginObj.userName && this.loginObj.password) {
      const user = this.users.find(u => u.userName === this.loginObj.userName && u.password === this.loginObj.password);
      if (user) {
        localStorage.setItem('currentUser', user.userName);
        this.router.navigate(['/dashboard']);
      } else {
        alert('Invalid credentials');
      }
    }
  }

}
