import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  @Input() title: string = 'Food Tracker';
  @Input() subtitle: string = 'Track your meals and stay healthy';
  @Input() backgroundImage: string = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';
  @Input() logoImage: string = '';
  @Input() showNavigation: boolean = true;

  private router = inject(Router);
  private authService = inject(AuthService);

  navigateToHome() {
    this.router.navigate(['/dashboard']);
  }

  navigateToProfile() {
    // Profile route belum ada di main.ts, redirect ke dashboard
    this.router.navigate(['/dashboard']);
  }

  navigateToSettings() {
    // Settings route belum ada di main.ts, redirect ke dashboard
    this.router.navigate(['/dashboard']);
  }

  logout() {
    console.log('Logout method called');
    this.authService.logout();
  }
}
