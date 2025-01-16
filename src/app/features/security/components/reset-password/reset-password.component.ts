import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { PasswordResetRequest } from "../../models/AuthRequest";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'app-reset-password',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  errorMessage: string | null = null;
  successMessage: string | null = null;
  confirmPassword: string = "";
  request: PasswordResetRequest = {
    verification_uuid: null,
    password: ""
  }
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.request.verification_uuid = params['uuid'];
      console.log('Robot UUID:', this.request.verification_uuid);
      if(!this.request.verification_uuid){
        this.router.navigate(['/not-found']);
      }
    });
  }

  changePassword(){
    if(this.request.password != this.confirmPassword){
      this.errorMessage = "Passwords do not match";
      return;
    }
    this.authService.resetPassword(this.request).subscribe({
      next: (response: boolean) => {
        console.log(response);
        this.successMessage = "Password reset successfully!"
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
