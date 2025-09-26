import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";

export const jwtInterceptor : HttpInterceptorFn = (req , next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log("JWT Interceptor - Request URL: " , req.url);
  console.log("JWT Interceptor - Token: " , token);

  if(req.url.includes('/login') || req.url.includes('/register')){
   console.log('JWT Inteceptor - Skipping token for auth endpoints');
    // If the request is for login or register, do not add the token
    return next(req);
  }

  if(token){
    console.log('JWT Interceptor - Adding token to request headers');
    const cloned = req.clone({
      headers: req.headers.set('Authorization' , 'Bearer ' + token)
    });
    return next(cloned);
  }
  else{
    console.warn('JWT Interceptor - No valid token found');
  }

  return next(req);
}
