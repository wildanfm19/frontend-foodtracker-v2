import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddFood, FoodItem } from "../food/add-food/add-food";
import { FoodCard } from "../food/food-card/food-card";
import { FoodService } from "../food/food.service";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, AddFood, FoodCard],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css', './loading.css', './date-picker.css']
})
export class Dashboard implements OnInit, OnDestroy {
  private foodService = inject(FoodService);
  private router = inject(Router);

  @ViewChild('hiddenDateInput') hiddenDateInput!: ElementRef<HTMLInputElement>;

  foods: FoodItem[] = [];
  mealTypes: string[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  isDeleting: boolean = false;
  isLoading: boolean = false;
  deleteLoadingTimer: any;

  // History mode properties
  viewHistoryMode: boolean = false;
  selectedDate: string = '';
  historyFoods: FoodItem[] = [];

  ngOnInit() {
    console.log('Dashboard ngOnInit called');
    this.loadAllMeals();
  }

  loadAllMeals() {
    this.isLoading = true;
    console.log('Starting to load meals for types:', this.mealTypes);

    // Create observables for all meal types
    const mealRequests = this.mealTypes.map(type => {
      console.log(`Creating request for meal type: ${type}`);
      return this.foodService.getMealsByType(type);
    });

    // Execute all requests in parallel
    forkJoin(mealRequests).subscribe({
      next: (responses) => {
        console.log('Received responses:', responses);

        // Clear existing foods
        this.foods = [];

        // Process each response and add meals to foods array
        responses.forEach((response, index) => {
          console.log(`Processing response ${index}:`, response);

          if (response.statusCode === '200' && response.data && response.data.content && Array.isArray(response.data.content)) {
            console.log(`Found ${response.data.content.length} meals for ${this.mealTypes[index]}`);
            response.data.content.forEach(meal => {
              console.log('Adding meal:', meal);
              this.foods.push({
                mealId: meal.mealId,
                date: meal.date,
                time: meal.time,
                mealType: meal.mealType,
                food: meal.food,
                description: meal.description
              });
            });
          } else {
            console.log(`No valid data for ${this.mealTypes[index]}:`, response);
          }
        });

        this.isLoading = false;
        console.log('Final foods array:', this.foods);
        console.log('Total meals loaded:', this.foods.length);
      },
      error: (error) => {
        console.error('Error loading meals:', error);
        console.error('Full error object:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error
        });

        // Log the response body if available
        if (error.error) {
          console.error('Backend error response:', error.error);
        }

        this.isLoading = false;

        // Show detailed error information for 400 errors
        if (error.status === 400) {
          const errorMessage = error.error?.message || error.error?.statusMessage || 'Bad Request';
          console.error('400 Bad Request details:', errorMessage);
          alert(`400 Bad Request: ${errorMessage}`);
        } else if (error.status === 0) {
          alert('CORS Error: Backend is blocking the request. Please check CORS configuration on your Spring Boot backend.');
        } else if (error.status === 404) {
          alert('API Endpoint not found. Please check if the endpoint path is correct.');
        } else {
          alert(`Backend Error (${error.status}): ${error.statusText || error.message}`);
        }
      }
    });
  }



  onFoodAdded(newFood: FoodItem) {
    // Add to local array immediately for better UX
    this.foods.push(newFood);
    // Optionally reload from backend to ensure consistency
    // this.loadAllMeals();
  }

  getFoodsByType(type: string): FoodItem[] {
    const sourceData = this.viewHistoryMode ? this.historyFoods : this.foods;
    return sourceData.filter(food => food.mealType === type);
  }

  onDeleteFood(foodToDelete: FoodItem) {
    if (this.isDeleting) return; // Prevent multiple delete requests

    // Set a timer to show loading only if request takes longer than 500ms
    this.deleteLoadingTimer = setTimeout(() => {
      this.isDeleting = true;
    }, 500);

    this.foodService.deleteMealById(foodToDelete.mealId).subscribe({
      next: (response) => {
        console.log('Food deleted successfully:', response);

        // Clear the loading timer
        if (this.deleteLoadingTimer) {
          clearTimeout(this.deleteLoadingTimer);
        }

        // Remove from local array after successful API call
        const index = this.foods.indexOf(foodToDelete);
        if (index > -1) {
          this.foods.splice(index, 1);
        }
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('Error deleting food:', error);

        // Clear the loading timer
        if (this.deleteLoadingTimer) {
          clearTimeout(this.deleteLoadingTimer);
        }

        // Show error message to user
        alert('Failed to delete food item. Please try again.');
        this.isDeleting = false;
      }
    });
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  goToLanding(): void {
    this.router.navigate(['/landing']);
  }

  // History Mode Methods
  setMode(isHistory: boolean): void {
    this.viewHistoryMode = isHistory;
    if (isHistory) {
      // Initialize with today's date when switching to history mode
      this.selectedDate = this.getTodayDate();
      this.loadFoodsForDate(this.selectedDate);
    }
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onDateChange(): void {
    if (this.selectedDate) {
      this.loadFoodsForDate(this.selectedDate);
    }
  }

  selectQuickDate(daysOffset: number): void {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    this.selectedDate = date.toISOString().split('T')[0];
    this.loadFoodsForDate(this.selectedDate);
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    const date = new Date(this.selectedDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTotalMealsForDate(): number {
    return this.historyFoods.length;
  }

  loadFoodsForDate(date: string): void {
    console.log('Loading foods for date:', date);
    this.isLoading = true;

    this.foodService.getMealsByDate(date).subscribe({
      next: (response) => {
        console.log('Meals loaded for date:', date, response);
        this.historyFoods = response.data.content.map(meal => ({
          mealId: meal.mealId,
          food: meal.food,
          description: meal.description,
          date: meal.date,
          time: meal.time,
          mealType: meal.mealType
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading meals for date:', error);
        this.historyFoods = [];
        this.isLoading = false;
      }
    });
  }

  getCurrentFoodsLength(): number {
    return this.viewHistoryMode ? this.historyFoods.length : this.foods.length;
  }

  // Custom Date Picker Methods
  openDatePicker(): void {
    console.log('Opening date picker...');

    // Try ViewChild first
    if (this.hiddenDateInput?.nativeElement) {
      console.log('Using ViewChild reference');
      const input = this.hiddenDateInput.nativeElement;

      // Mobile-friendly approach
      this.triggerMobileDatePicker(input);
      return;
    }

    // Fallback to document query
    const hiddenInput = document.querySelector('.hidden-date-input') as HTMLInputElement;
    if (hiddenInput) {
      console.log('Using document query fallback');
      this.triggerMobileDatePicker(hiddenInput);
    } else {
      console.error('Hidden date input not found');
    }
  }

  private triggerMobileDatePicker(input: HTMLInputElement): void {
    // Multiple approaches for maximum compatibility

    // Method 1: Try showPicker() for modern browsers
    if (input.showPicker && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        console.log('showPicker() method worked');
        return;
      } catch (error) {
        console.log('showPicker() failed, trying alternatives');
      }
    }

    // Method 2: Mobile-friendly approach - create temporary visible input
    if (this.isMobileDevice()) {
      this.createMobileDatePicker(input);
    } else {
      // Method 3: Desktop fallback
      this.triggerDesktopDatePicker(input);
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0);
  }

  private createMobileDatePicker(originalInput: HTMLInputElement): void {
    // Create a temporary visible date input for mobile
    const tempInput = document.createElement('input');
    tempInput.type = 'date';
    tempInput.value = originalInput.value;
    tempInput.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 50px;
      background: white;
      border: 2px solid #28a745;
      border-radius: 10px;
      font-size: 16px;
      padding: 10px;
      z-index: 9999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9998;
    `;

    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(tempInput);

    // Handle change
    tempInput.onchange = () => {
      originalInput.value = tempInput.value;
      originalInput.dispatchEvent(new Event('change', { bubbles: true }));
      this.onDateChange();
      this.removeMobileDatePicker(tempInput, overlay);
    };

    // Handle cancel (click overlay)
    overlay.onclick = () => {
      this.removeMobileDatePicker(tempInput, overlay);
    };

    // Focus the input to open native picker
    setTimeout(() => {
      tempInput.focus();
      if (tempInput.showPicker) {
        tempInput.showPicker();
      }
    }, 100);
  }

  private removeMobileDatePicker(input: HTMLInputElement, overlay: HTMLElement): void {
    document.body.removeChild(input);
    document.body.removeChild(overlay);
  }

  private triggerDesktopDatePicker(input: HTMLInputElement): void {
    // Focus and trigger events for desktop
    setTimeout(() => {
      // Make input temporarily visible and focusable
      input.style.opacity = '1';
      input.style.pointerEvents = 'auto';
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      input.style.width = '1px';
      input.style.height = '1px';

      // Focus and trigger click
      input.focus();

      // Trigger various events
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      input.dispatchEvent(new Event('click', { bubbles: true }));
      input.dispatchEvent(new Event('mousedown', { bubbles: true }));

      // Hide again after a short delay
      setTimeout(() => {
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        input.style.position = 'absolute';
        input.style.left = '0';
        input.style.width = '1px';
        input.style.height = '1px';
      }, 100);
    }, 10);
  }

  formatDisplayDate(date: string): string {
    if (!date) return '';

    const dateObj = new Date(date + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today or yesterday
    if (this.isSameDate(dateObj, today)) {
      return 'Today';
    } else if (this.isSameDate(dateObj, yesterday)) {
      return 'Yesterday';
    } else {
      // Format as "Mon, Dec 25"
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  onAddMealRequest(): void {
    // Switch to add food mode if currently in history mode
    if (this.viewHistoryMode) {
      this.setMode(false);
    }

    // Focus on the first input field in the add-food form
    setTimeout(() => {
      const firstInput = document.querySelector('.add-food-sidebar input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
        firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  getMealStatLabel(): string {
    if (this.viewHistoryMode) {
      return 'meals found';
    } else {
      const count = this.getCurrentFoodsLength();
      return count === 1 ? 'meal today' : 'meals today';
    }
  }

  getMealStatDescription(): string {
    if (this.viewHistoryMode) {
      return this.selectedDate ? `on ${this.formatSelectedDate()}` : 'for selected date';
    } else {
      const count = this.getCurrentFoodsLength();
      if (count === 0) {
        return 'Start your journey!';
      } else if (count <= 2) {
        return 'Keep it up!';
      } else if (count <= 4) {
        return 'Great progress!';
      } else {
        return 'Amazing dedication!';
      }
    }
  }

  ngOnDestroy() {
    // Cleanup timer jika masih ada
    if (this.deleteLoadingTimer) {
      clearTimeout(this.deleteLoadingTimer);
    }
  }
}
