import { Inject, Injectable } from '@angular/core';
import { AuthResponse, AuthResponseForRefresh } from '../../features/security/models/AuthResponse';
import { UserResponse } from '../../features/security/models/UserResponse';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {
  private uniqueTokenKey = 'unique-token';
  private accessTokenKey = 'access-token';
  private userKey = 'user';

  constructor(
    @Inject(CookieService) private cookieService: CookieService
  ) { }

  save(response: AuthResponse) {
    this.cookieService.set(this.uniqueTokenKey, response.unique_token, 30, '/');
    localStorage.setItem(this.accessTokenKey, response.access_token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  saveForRefresh(response: AuthResponseForRefresh) {
    localStorage.setItem(this.accessTokenKey, response.access_token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  getUniqueToken(): string | null {
    return this.cookieService.get(this.uniqueTokenKey) || null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getUser(): UserResponse | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) as UserResponse : null;
  }

  isAuthenticated(): boolean {
    if (!this.getUniqueToken() || !this.getAccessToken() || !this.getUser()) {
      return false;
    }
    return true;
  }

  clear() {
    this.cookieService.delete(this.uniqueTokenKey, '/');
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.userKey);
  }
}