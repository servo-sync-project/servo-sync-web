import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SendEmailRequest } from '../../models/AuthRequest';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  errorMessage: string | null = null;
  emailToValidate: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.emailToValidate = params['email'];
      console.log('Correo a validar:', this.emailToValidate);
      if(!this.emailToValidate){
        this.router.navigate(['/not-found']);
      }
      this.sendVerificationEmail();
    });
  }

  sendVerificationEmail() {
    if(!this.emailToValidate) return;
    const request: SendEmailRequest = {
      email: this.emailToValidate
    }
    this.authService.sendEmailToVerifyEmail(request).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
