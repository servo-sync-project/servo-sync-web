import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { EmailVerificationRequest, LoginUserRequest, PasswordResetRequest, SendEmailRequest, RefreshTokenRequest, RegisterUserRequest } from '../models/AuthRequest';
import { AuthResponse, AuthResponseForRefresh } from '../models/AuthResponse';
import { URL_SERVICIOS } from '../../../core/config/config';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private httpClient: HttpClient,
    private authStorage: AuthStorageService,
  ) { }

  login(request: LoginUserRequest) {
    let URL = URL_SERVICIOS + "/auth/login";
    return this.httpClient.post<AuthResponse>(URL, request).pipe(
      map((response: AuthResponse)=>{
        this.authStorage.save(response);
        return response;
      })
    )
  }

  register(request: RegisterUserRequest) {
    let URL = URL_SERVICIOS + "/auth/register";
    return this.httpClient.post<{email_to_verify: string}>(URL, request);
  }

  refreshToken(request: RefreshTokenRequest) {
    let URL = URL_SERVICIOS + "/auth/refresh-token";
    return this.httpClient.post<AuthResponseForRefresh>(URL, request);
  }

  sendEmailToVerifyEmail(request: SendEmailRequest) {
    let URL = URL_SERVICIOS + "/auth/verify-email/send-email";
    return this.httpClient.post<boolean>(URL, request);
  }

  verifyEmail(request: EmailVerificationRequest) {
    let URL = URL_SERVICIOS + "/auth/verify-email";
    return this.httpClient.post<boolean>(URL, request);
  }

  sendEmailToResetPassword(request: SendEmailRequest) {
    let URL = URL_SERVICIOS + "/auth/forgot-password/send-email";
    return this.httpClient.post<boolean>(URL, request);
  }

  resetPassword(request: PasswordResetRequest) {
    let URL = URL_SERVICIOS + "/auth/forgot-password/reset-password";
    return this.httpClient.post<boolean>(URL, request);
  }
}
