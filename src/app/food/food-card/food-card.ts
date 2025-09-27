import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FoodItem } from '../add-food/add-food';

@Component({
  selector: 'app-food-card',
  imports: [CommonModule],
  templateUrl: './food-card.html',
  styleUrl: './food-card.css'
})
export class FoodCard {
  @Input() mealType: string = '';
  @Input() foods: FoodItem[] = [];
  @Input() allowDelete: boolean = true; // New input to control delete permission
  @Input() isHistoryMode: boolean = false; // New input to know if viewing history
  @Input() selectedDate: string = ''; // New input for the selected date
  @Output() deleteFood = new EventEmitter<FoodItem>();
  @Output() addMealRequest = new EventEmitter<void>();

  private router = inject(Router);

  getMealTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'BREAKFAST': 'bi-sunrise',
      'LUNCH': 'bi-sun',
      'DINNER': 'bi-moon',
      'SNACK': 'bi-cookie'
    };
    return icons[type] || 'bi-circle';
  }

  getMealTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'BREAKFAST': '#ff9500',
      'LUNCH': '#007bff',
      'DINNER': '#6610f2',
      'SNACK': '#28a745'
    };
    return colors[type] || '#28a745';
  }

  onDeleteFood(food: FoodItem) {
    this.deleteFood.emit(food);
  }

  trackByMealId(index: number, food: FoodItem): number {
    return food.mealId;
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.slice(0, 5); // Returns HH:MM format
  }

  formatDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  onAddMeal() {
    this.addMealRequest.emit();
  }

  canDeleteFood(food: FoodItem): boolean {
    // Can only delete if both conditions are met:
    // 1. General delete permission is allowed
    // 2. The food item is from today
    return this.allowDelete && this.isFromToday(food);
  }  isFromToday(food: FoodItem): boolean {
    const today = new Date();
    const foodDate = new Date(food.date);

    return (
      today.getFullYear() === foodDate.getFullYear() &&
      today.getMonth() === foodDate.getMonth() &&
      today.getDate() === foodDate.getDate()
    );
  }

  getEmptyTitle(): string {
    if (this.isHistoryMode) {
      return `No ${this.mealType.toLowerCase()} recorded`;
    }
    return `Ready for ${this.mealType.toLowerCase()}?`;
  }

  getEmptySubtitle(): string {
    if (this.isHistoryMode) {
      return `No ${this.mealType.toLowerCase()} was logged on ${this.formatSelectedDate()}`;
    }
    return 'Start logging your meals to track your nutrition journey';
  }

  getEmptyButtonText(): string {
    if (this.isHistoryMode) {
      return 'View today\'s meals';
    }
    return 'Add your first meal';
  }

  shouldShowAddButton(): boolean {
    return !this.isHistoryMode;
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return 'this date';

    const date = new Date(this.selectedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Check if it's today
    if (this.isDateSame(date, today)) {
      return 'today';
    }

    // Check if it's yesterday
    if (this.isDateSame(date, yesterday)) {
      return 'yesterday';
    }

    // Return formatted date for other days
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }

  private isDateSame(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
