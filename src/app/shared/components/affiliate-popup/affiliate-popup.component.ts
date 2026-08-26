import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-affiliate-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-popup.component.html',
  styleUrls: ['./affiliate-popup.component.scss']
})
export class AffiliatePopupComponent {
  @Input() showPopup: boolean = false;
  @Output() closePopup = new EventEmitter<void>();

  
apiUrl = environment.base_url;
  formData = {
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onClose(): void {
    this.resetForm();
    this.closePopup.emit();
  }

  onOutsideClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('affiliate-popup-overlay')) {
      this.onClose();
    }
  }

  resetForm(): void {
    this.formData = {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = false;
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.formData.email);
  }

  isPasswordValid(): boolean {
    return this.formData.password && this.formData.password.length >= 8;
  }

  isConfirmPasswordValid(): boolean {
    return this.formData.confirmPassword && this.formData.password === this.formData.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = true;

    if (!this.formData.name.trim() || !this.formData.phone.trim() || !this.formData.email.trim() ||
        !this.isPasswordValid() || !this.isConfirmPasswordValid()) {
      return;
    }

    this.isLoading = true;

    const payload = {
      name: this.formData.name.trim(),
      phone: this.formData.phone.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password
    };

    this.http.post(this.apiUrl + 'affiliate/register', payload, { observe: 'response' }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.body && response.body.status) {
          this.successMessage = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.onClose();
            this.router.navigate(['/login'], { queryParams: { affiliate: 'true' } });
          }, 2000);
        } else {
          this.errorMessage = response.body?.error || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        const errBody = error.error || error.message || error;
        if (typeof errBody === 'object' && errBody !== null) {
          this.errorMessage = errBody.error || errBody.message || 'Registration failed. Please try again.';
        } else {
          this.errorMessage = typeof errBody === 'string' ? errBody : 'Registration failed. Please try again.';
        }
      }
    });
  }

  goToLogin(): void {
    this.onClose();
    this.router.navigate(['/login']);
  }
}