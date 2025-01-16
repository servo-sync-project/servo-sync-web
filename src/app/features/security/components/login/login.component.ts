import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { AuthStorageService } from "../../../../core/services/auth-storage.service";
import { LoginUserRequest, EmailVerificationRequest } from "../../models/AuthRequest";
import { AuthResponse } from "../../models/AuthResponse";
import { AuthService } from "../../services/auth.service";


@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{  
  verificationUuid: string = "";
  errorMessage: string = "";
  hidePassword: boolean = true;
  request: LoginUserRequest = {
    email: "",
    password: "",
  };


  constructor(
    private authStorage: AuthStorageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if(this.authStorage.isAuthenticated()){
      this.router.navigateByUrl("/device/connection");
    }
    this.route.queryParams.subscribe(params => {
      this.verificationUuid = params['uuid'];
      console.log('Robot UUID:', this.verificationUuid);
      if(this.verificationUuid){
        this.verifyAccount();
      }
    });
  }
  verifyAccount(){
    const request: EmailVerificationRequest = {
      verification_uuid: this.verificationUuid
    }
    this.authService.verifyEmail(request).subscribe({
          next: (response: boolean) => {
            console.log(response);
            this.router.navigate(['/login']);
          },
          error: (error: Error) => {
            this.errorMessage = error.message;
            this.router.navigate(['/not-found']);
          }
        })
  }

  login(){
    if(!this.request.email || !this.request.password){
      this.errorMessage = "You need to enter all fields";
      return;
    }
    this.authService.login(this.request).subscribe({
      next: (response: AuthResponse) => {
        this.router.navigate(['/device/connection'])
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
