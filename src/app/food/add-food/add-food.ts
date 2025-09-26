import { Component, EventEmitter, Output, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FoodService, MealRequest } from '../food.service';

export interface FoodItem {
  mealId: number;
  date: string;
  time: string;
  food: string;
  description: string;
  mealType: string;
}

@Component({
  selector: 'app-add-food',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-food.html',
  styleUrl: './add-food.css'
})
export class AddFood implements OnInit {
  private foodService = inject(FoodService);
  @Output() foodAdded = new EventEmitter<FoodItem>();
  @ViewChild('foodForm') foodForm!: NgForm;

  foodName: string = '';
  description: string = '';
  mealType: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  mealTypes = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: 'bi-sunrise', color: '#ff9500' },
    { value: 'LUNCH', label: 'Lunch', icon: 'bi-sun', color: '#007bff' },
    { value: 'DINNER', label: 'Dinner', icon: 'bi-moon', color: '#6610f2' },
    { value: 'SNACK', label: 'Snack', icon: 'bi-cookie', color: '#28a745' }
  ];

  ngOnInit() {
    // Set initial meal type based on current time
    this.mealType = this.getAutoMealType();
  }

  addFood() {
    if (this.foodName.trim() && this.description.trim()) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const mealRequest: MealRequest = {
        food: this.foodName.trim(),
        description: this.description.trim()
      };

      console.log('Adding food:', mealRequest, 'to', this.mealType);

      this.foodService.addMeal(this.mealType, mealRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Food item added successfully! 🎉';

          const newFood: FoodItem = {
            mealId: response.data.mealId,
            date: response.data.date,
            time: response.data.time,
            food: response.data.food,
            description: response.data.description,
            mealType: response.data.mealType
          };

          this.foodAdded.emit(newFood);

          // Reset form after delay to show success message
          setTimeout(() => {
            this.resetForm();
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to add food item. Please try again.';
          console.error('Error adding food:', error);
        }
      });
    }
  }

  resetForm() {
    const autoMealType = this.getAutoMealType();
    this.foodName = '';
    this.description = '';
    this.mealType = autoMealType;
    this.successMessage = '';
    this.errorMessage = '';

    // Reset form validation state
    if (this.foodForm) {
      this.foodForm.resetForm({
        foodName: '',
        description: '',
        mealType: autoMealType
      });
    }
  }

  getMealTypeByValue(value: string) {
    return this.mealTypes.find(type => type.value === value) || this.mealTypes[0];
  }

  /**
   * Automatically determine meal type based on current time
   * Time ranges:
   * - 03:00 - 10:59: BREAKFAST
   * - 11:00 - 15:59: LUNCH
   * - 16:00 - 18:59: SNACK
   * - 19:00 - 02:59: DINNER
   */
  getAutoMealType(): string {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 3 && hour < 11) {
      return 'BREAKFAST';
    } else if (hour >= 11 && hour < 16) {
      return 'LUNCH';
    } else if (hour >= 16 && hour < 19) {
      return 'SNACK';
    } else {
      // 19:00 - 02:59 (including late night/early morning)
      return 'DINNER';
    }
  }

  /**
   * Get current time in HH:MM format for display
   */
  getCurrentTimeString(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
