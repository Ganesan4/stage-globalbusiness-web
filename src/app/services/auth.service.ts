import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSource = new BehaviorSubject<boolean>(this.checkInitialLoginState());
  isLoggedIn$ = this.loggedInSource.asObservable();

  constructor(private router: Router) {}

  private checkInitialLoginState(): boolean {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        return true;
      }
      if (localStorage.getItem('affiliateUser') === 'true') {
        return true;
      }
    }
    return false;
  }

  setLoggedIn(value: boolean) {
    this.loggedInSource.next(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', value ? 'true' : 'false');
    }
  }

  /**
   * Set referral code for new registration
   */
  setReferralCode(code: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('registrationReferralCode', code);
    }
  }

  /**
   * Get referral code from localStorage
   */
  getReferralCode(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('registrationReferralCode');
    }
    return null;
  }

  /**
   * Clear referral code after registration completes
   */
  clearReferralCode(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('registrationReferralCode');
    }
  }

  logout(): void {
    this.setLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('registrationReferralCode');
    }
    this.router.navigate(['/login']).then(() => {
      window.history.pushState(null, '', window.location.href);
    });
  }
  
}
