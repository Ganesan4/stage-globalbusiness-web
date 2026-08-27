import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-affiliate-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-registration.component.html',
  styleUrls: ['./affiliate-registration.component.scss']
})
export class AffiliateRegistrationComponent implements OnInit, OnDestroy {
  isSliderOpen = false;
  
  formData = {
    name: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  apiUrl = environment.api_url;
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {}
  
  ngOnDestroy(): void {}
  
  openSlider(): void {
    this.isSliderOpen = true;
    this.resetForm();
    document.body.style.overflow = 'hidden';
  }
  
  closeSlider(): void {
    this.isSliderOpen = false;
    document.body.style.overflow = '';
  }
  
  resetForm(): void {
    this.formData = {
      name: '',
      address: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  validateForm(): boolean {
    if (!this.formData.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }
    if (!this.formData.address.trim()) {
      this.errorMessage = 'Address is required';
      return false;
    }
    if (!this.formData.phone.trim()) {
      this.errorMessage = 'Phone number is required';
      return false;
    }
    if (!this.formData.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }
    if (!this.formData.password) {
      this.errorMessage = 'Password is required';
      return false;
    }
    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    return true;
  }
  
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    
    const payload = {
      name: this.formData.name.trim(),
      address: this.formData.address.trim(),
      phone: this.formData.phone.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      user_type: 'affiliate'
    };
    
    this.http.post(this.apiUrl + 'affiliate/register', payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status) {
          this.successMessage = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.closeSlider();
            this.router.navigate(['/login'], { queryParams: { affiliate: 'true' } });
          }, 2000);
        } else {
          this.errorMessage = response.error || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.errorMessage = error.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
  
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('affiliate-slider-overlay')) {
      this.closeSlider();
    }
  }
}