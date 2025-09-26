import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Login } from './app/auth/login/login';
import { Register } from './app/auth/register/register';
import { Dashboard } from './app/dashboard/dashboard';
import { AddFood } from './app/food/add-food/add-food';
import { LandingPage } from './app/landing-page/landing-page';
import { jwtInterceptor } from './app/auth/jwt.interceptor';
import { authGuard, loginGuard } from './app/auth/auth.guard';

const routes: Routes = [

  //AUTH - These routes are accessible when NOT authenticated
  {path: 'login' , component : Login, canActivate: [loginGuard]},
  {path: 'register' , component : Register, canActivate: [loginGuard]},
  {path: '' , redirectTo: 'login' , pathMatch: 'full'},

  //PROTECTED ROUTES - These routes require authentication
  {path: 'landing' , component : LandingPage, canActivate: [authGuard]},
  {path: 'dashboard' , component :  Dashboard, canActivate: [authGuard]},
  {path: 'add-food' , component : AddFood, canActivate: [authGuard]},

  // Wildcard route - redirect to login if route not found
  {path: '**', redirectTo: 'login'}




]



bootstrapApplication(App, {...appConfig ,
  providers: [
    ...(appConfig.providers || []),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ],
})
  .catch((err) => console.error(err));
