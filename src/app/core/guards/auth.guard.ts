import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthStorageService } from '../services/auth-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  implements CanActivate{
  constructor(
    private router: Router,
    private authStorage: AuthStorageService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let uniqueToken = this.authStorage.getUniqueToken()
    let accessToken = this.authStorage.getAccessToken()
    let user = this.authStorage.getUser()
    
    if(!uniqueToken || !accessToken || !user){
      this.authStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }

    let expiration = (JSON.parse(atob(accessToken.split(".")[1]))).exp;
    let now = Math.floor(Date.now() / 1000);
    // console.log(expiration + " > "+ now + ": " + (expiration-now))
    if(now < expiration) return true;

    this.authStorage.clear();
    this.router.navigate(['/login']);
    return false;
  }
}