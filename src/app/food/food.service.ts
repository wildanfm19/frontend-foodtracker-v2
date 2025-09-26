import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface MealRequest {
  food: string;
  description: string;
}

export interface MealResponse {
  statusCode: string;
  statusMessage: string;
  data: {
    mealId: number;
    date: string;
    time: string;
    mealType: string;
    food: string;
    description: string;
  };
}

export interface MealsByTypeResponse {
  statusCode: string;
  statusMessage: string;
  data: {
    content: {
      mealId: number;
      date: string;
      time: string;
      mealType: string;
      food: string;
      description: string;
    }[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    lastPage: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private http = inject(HttpClient);
  private baseUrl = 'https://food-tracker-app-8a34f8adb88a.herokuapp.com/api';

  addMeal(mealType: string, meal: MealRequest): Observable<MealResponse> {
    return this.http.post<MealResponse>(`${this.baseUrl}/add/${mealType.toLowerCase()}`, meal);
  }

  getMealsByType(mealType: string): Observable<MealsByTypeResponse> {
    const url = `${this.baseUrl}/meal/type/${mealType.toLowerCase()}`;
    console.log('Making API call to:', url);

    return this.http.get<MealsByTypeResponse>(url).pipe(
      catchError(error => {
        // Handle "no meals" case gracefully
        if (error.status === 400 && error.error?.errorMessage?.includes('no meals')) {
          console.log(`No meals found for ${mealType}, returning empty response`);
          // Return empty response structure
          return of({
            statusCode: '200',
            statusMessage: 'No meals found',
            data: {
              content: [],
              pageNumber: 0,
              pageSize: 50,
              totalElements: 0,
              totalPages: 0,
              lastPage: true
            }
          });
        }
        // Re-throw other errors
        throw error;
      })
    );
  }

  deleteMealById(mealId: number): Observable<any>{
    return this.http.delete(`${this.baseUrl}/meal/${mealId}`);
  }

  getMealsByDate(date: string): Observable<MealsByTypeResponse> {
    const url = `${this.baseUrl}/meal/date/${date}`;
    console.log('Making API call to get meals by date:', url);

    return this.http.get<MealsByTypeResponse>(url).pipe(
      catchError(error => {
        // Handle "no meals" case gracefully
        if (error.status === 400 && error.error?.errorMessage?.includes('no meals')) {
          console.log(`No meals found for date ${date}, returning empty response`);
          // Return empty response structure
          return of({
            statusCode: '200',
            statusMessage: 'No meals found for this date',
            data: {
              content: [],
              pageNumber: 0,
              pageSize: 50,
              totalElements: 0,
              totalPages: 0,
              lastPage: true
            }
          });
        }
        // Re-throw other errors
        throw error;
      })
    );
  }
}
