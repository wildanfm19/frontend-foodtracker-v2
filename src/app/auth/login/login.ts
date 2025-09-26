import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { LoginRequest } from '../auth.model';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  loginRequest: LoginRequest = {
    email: '',
    password: ''
  }

  errorMessage: string = '';
  isLoading: boolean = false;

  onSubmit(){
    // Clear previous error messages and set loading state
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginRequest).subscribe({
      next: (res) => {
        console.log('Login successful', res);
        this.isLoading = false;

        // Store the token in localStorage if needed
        if(res.data && res.data.token){
          localStorage.setItem('jwt_token', res.data.token);
          console.log('Token stored in localStorage');
        } else {
          console.error('No token found in response');
        }

        // Navigate to return URL or default to landing page
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/landing';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        console.error('Login failed');
        console.error(error.message || 'Unknown error');
        this.isLoading = false;

        // Handle different error scenarios
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.status === 404) {
          this.errorMessage = 'User not found. Please check your email address.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      },
      complete: () => {
        console.log('Login request completed');
        this.isLoading = false;
        // This runs when the observable completes (regardless of success/error)
      }
    })
  }

  onClickRegister(){
    this.router.navigate(['/register']);
  }

  clearErrorMessage() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }



}
