import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { RegisterRequest } from '../auth.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router)

  registerRequest : RegisterRequest = {
    firstName: '',
    lastName: '',
    email : '',
    password: ''
  }

  onSubmit(){
    this.authService.register(this.registerRequest).subscribe({
      next: (res) => {
        console.log('Registration successful', res);
          // Store the token in localStorage if needed
        if(res.data && res.data.token){
          localStorage.setItem('jwt_token', res.data.token);
          console.log('Token stored in localStorage');
        } else {
          console.error('No token found in response');
        }
        this.router.navigate(['/landing']);
        // Navigate to another page or perform other actions upon successful registration
      },
      error: (error) => {
        console.error('Registration failed:', error);
        console.error('Full error object:', error);
        // Handle registration errors (show error message to user, etc.)
      },
      complete: () => {
        console.log('Registration request completed');
      }
    })
  }

  onClickLogin(){
    this.router.navigate(['/login']);
  }

}
