import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { RegisterUserRequest } from "../../models/AuthRequest";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'app-register',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {  
  public confirmPassword: string = ""
  public errorMessage: string = ""
  public hidePassword: boolean = true;
  public request: RegisterUserRequest = {
    email: "",
    username: "",
    password: ""
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(){
    if(!this.request.email || !this.request.username){
      this.errorMessage = "You need to enter all fields";
      return;
    }
    if(this.request.password != this.confirmPassword){
      this.errorMessage = "Passwords do not match";
      return;
    }
    this.authService.register(this.request).subscribe({
      next: (response: {email_to_verify: string}) => {
        console.log(response);
        this.router.navigate(['/verify-email'], { queryParams: { email:  response.email_to_verify} });
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
