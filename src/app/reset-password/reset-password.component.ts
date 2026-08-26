import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PasswordResetService } from '../services/password-reset.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  isLoading = false;
  isTokenValid = false;
  isTokenChecking = true;
  message = '';
  isError = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordResetService: PasswordResetService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.validateToken();
      } else {
        this.isTokenChecking = false;
        this.message = 'Invalid reset link. Please request a new password reset.';
        this.isError = true;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  validateToken() {
    this.isTokenChecking = true;
    this.passwordResetService.validateToken(this.token).subscribe({
      next: (response) => {
        this.isTokenChecking = false;
        this.isTokenValid = response.status || response.valid || false;
        if (!this.isTokenValid) {
          this.message = response.error || 'Invalid or expired reset token. Please request a new password reset.';
          this.isError = true;
        }
      },
      error: () => {
        this.isTokenChecking = false;
        this.isTokenValid = false;
        this.message = 'Invalid or expired reset token. Please request a new password reset.';
        this.isError = true;
      }
    });
  }

  get password() {
    return this.resetForm.get('password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.passwordResetService.resetPassword(
      this.token,
      this.resetForm.value.password,
      this.resetForm.value.confirmPassword
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.message = 'Password reset successful! Redirecting to login...';
          this.isError = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.message = response.error || 'Failed to reset password. Please try again.';
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

  togglePassword(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}