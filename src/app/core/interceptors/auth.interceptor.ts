import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthStorageService } from '../services/auth-storage.service';
import { AuthService } from '../../features/security/services/auth.service';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { RefreshTokenRequest } from '../../features/security/models/AuthRequest';
import { AuthResponseForRefresh } from '../../features/security/models/AuthResponse';

let refreshAttempt = 0;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authStorage = inject(AuthStorageService);
  const authService = inject(AuthService);

  let uniqueToken = authStorage.getUniqueToken()
  let accessToken = authStorage.getAccessToken()
  let user = authStorage.getUser()

  if(!uniqueToken || !accessToken || !user){
    authStorage.clear();
    return next(req).pipe(catchError(handleError))
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    }
  });

  const request: RefreshTokenRequest = {
    unique_token: uniqueToken
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status !== 401 || refreshAttempt >= 3) return handleError(error);
      refreshAttempt++;
      return authService.refreshToken(request).pipe(
        switchMap((response: AuthResponseForRefresh) => {
          console.log(response);
          refreshAttempt = 0;
          authStorage.saveForRefresh(response);
          const newAuthReq = authReq.clone({
            setHeaders: {
              Authorization: `Bearer ${response.access_token}`
            }
          });
          return next(newAuthReq);
        }),
        catchError((refreshError) => {
          authStorage.clear();
          return handleError(refreshError);
        })
      )
    })
  );


};

const handleError = (error: HttpErrorResponse) => {
  console.error(error);
  let errorMessage = 'Unexpected error';
  if(error.status == 422){
    errorMessage = error.error.detail[0].msg;
  }else if (error.error && error.error.detail) {
    errorMessage = error.error.detail;
  }
  return throwError(() => new Error(errorMessage));
}