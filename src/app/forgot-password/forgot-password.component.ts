import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PasswordResetService } from '../services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  message = '';
  isError = false;

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.passwordResetService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.message = 'Password reset link sent to your email. Please check your inbox.';
          this.isError = false;
        } 
        else if(response.message='Email not registered'){
        this.message = 'No registered account exists for the entered email address';
        this.isError = true;
        }else {
          this.message = response.error || 'Something went wrong. Please try again.';
          this.isError = true;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.message = 'An error occurred. Please try again later.';
        this.isError = true;
      }
    });
  }
}