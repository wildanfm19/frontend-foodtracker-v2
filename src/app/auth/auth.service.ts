import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginRequest, RegisterRequest } from './auth.model';
import { catchError, throwError } from 'rxjs';
import { routes } from '../app.routes';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = 'https://food-tracker-app-8a34f8adb88a.herokuapp.com/api/v1/auth';
  private route = inject(Router);

  register(req: RegisterRequest) {
    return this.http.post<any>(`${this.url}/register`, req).pipe(
      catchError((error) => {
        return throwError(
          () => new Error(error.message || 'Something went wrong!')
        );
      })
    );
  }


  login(req: LoginRequest) {
    return this.http.post<any>(`${this.url}/login`, req).pipe(
      catchError((error) => {
        console.log('ERROR : ' + error);
        return throwError(
          () => new Error(error.message || 'Something went wrong on register!')
        );
      })
    )
  }

  // Method to get JWT token from localstorage
  getToken(){
    return localStorage.getItem('jwt_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      // Check if token is expired (basic check)
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        // Token expired, remove it
        this.logout();
        return false;

      }

      return true;
    } catch (error) {
      // Invalid token format
      this.logout();
      return false;
    }
  }

  // Logout method
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.route.navigate(['/login']);
  }


}
