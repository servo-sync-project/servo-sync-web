import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SendEmailRequest } from "../../models/AuthRequest";
import { AuthService } from "../../services/auth.service";


@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  errorMessage: string | null = null;

  request: SendEmailRequest = {
    email: ""
  };

  constructor(
    private authService: AuthService,
  ) { }

  sendForgotPasswordLink(){
    if(!this.request.email){
      this.errorMessage = "You need to enter all fields";
      return;
    }
    this.authService.sendEmailToResetPassword(this.request).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
