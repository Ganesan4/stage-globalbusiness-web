import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-affiliate-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-dashboard.component.html',
  styleUrls: ['./affiliate-dashboard.component.scss']
})
export class AffiliateDashboardComponent implements OnInit {
  apiUrl = environment.base_url;
  
  isSidebarOpen = true;
  activeTab = 'profile';
  isDropDownOpen = true;
  
  affiliateData = {
    name: localStorage.getItem('affiliateName') || '',
    email: localStorage.getItem('affiliateEmail') || '',
    referralCode: localStorage.getItem('affiliateReferralCode') || ''
  };
  
  profileForm = {
    name: '',
    phone: '',
    email: ''
  };
  
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  isLoading = false;
  isPasswordLoading = false;
  successMessage = '';
  errorMessage = '';
  passwordSubmitted = false;
  profileSubmitted = false;
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    if (localStorage.getItem('affiliateUser') !== 'true') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadAffiliateData();
  }
  
  loadAffiliateData(): void {
    const affiliateId = localStorage.getItem('affiliateId');
    if (affiliateId) {
      this.http.get(this.apiUrl + 'affiliate/user/' + affiliateId).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.profileForm = {
              name: response.data.name,
              phone: response.data.phone,
              email: response.data.email
            };
          }
        },
        error: (error) => {
          console.error('Error loading affiliate data:', error);
        }
      });
    }
  }
  
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  
  toggleSidebar_close(): void {
    this.isSidebarOpen = false;
  }
  
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    this.successMessage = '';
    this.errorMessage = '';
    this.isDropDownOpen = false;
  }
  
  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }
  
  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }
  
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isNewPasswordValid(): boolean {
    return this.passwordForm.newPassword && this.passwordForm.newPassword.length >= 8;
  }

  isConfirmPasswordValid(): boolean {
    return this.passwordForm.confirmPassword && this.passwordForm.newPassword === this.passwordForm.confirmPassword;
  }
  
  updateProfile(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.profileSubmitted = true;

    if (!this.profileForm.name.trim() || !this.profileForm.phone.trim()) {
      return;
    }

    this.isLoading = true;
    
    const affiliateId = localStorage.getItem('affiliateId');
    this.http.put(this.apiUrl + 'affiliate/user/' + affiliateId, this.profileForm).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status) {
          localStorage.setItem('affiliateName', this.profileForm.name);
          this.affiliateData.name = this.profileForm.name;
          this.successMessage = 'Profile updated successfully';
          this.profileSubmitted = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.error || 'Failed to update profile';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to update profile';
      }
    });
  }
  
  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.passwordSubmitted = true;

    if (!this.passwordForm.currentPassword || !this.isNewPasswordValid() || !this.isConfirmPasswordValid()) {
      return;
    }

    this.isPasswordLoading = true;
    
    const affiliateId = localStorage.getItem('affiliateId');
    this.http.post(this.apiUrl + 'affiliate/change-password', {
      id: affiliateId,
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (response: any) => {
        this.isPasswordLoading = false;
        if (response.status) {
          this.successMessage = 'Password changed successfully';
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          this.passwordSubmitted = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.error || 'Failed to change password';
        }
      },
      error: (error) => {
        this.isPasswordLoading = false;
        this.errorMessage = error.error?.error || 'Failed to change password';
      }
    });
  }
  
  logout(): void {
    localStorage.removeItem('affiliateUser');
    localStorage.removeItem('affiliateId');
    localStorage.removeItem('affiliateName');
    localStorage.removeItem('affiliateEmail');
    localStorage.removeItem('affiliateReferralCode');
    this.router.navigate(['/login']);
  }
  
getReferralLink(): string {
    return `${window.location.origin}/register?ref=${this.affiliateData.referralCode}`;
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.affiliateData.referralCode);
    this.successMessage = 'Referral code copied!';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
  
  copyLink(): void {
    navigator.clipboard.writeText(this.getReferralLink());
    this.successMessage = 'Referral link copied!';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
  
  shareViaEmail(): void {
    const subject = encodeURIComponent('Join Global Business Pages Affiliate Program');
    const body = encodeURIComponent(`Sign up using my referral code: ${this.affiliateData.referralCode}\n\nReferral link: window.location.origin/register?ref=${this.affiliateData.referralCode}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }
  
  shareViaWhatsApp(): void {
    const text = encodeURIComponent(`Join Global Business Pages! Use my referral code: ${this.affiliateData.referralCode}\n\nLink: window.location.origin/register?ref=${this.affiliateData.referralCode}`);
    window.open(`https://wa.me/?text=${text}`);
  }
}