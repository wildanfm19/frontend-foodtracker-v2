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
}
