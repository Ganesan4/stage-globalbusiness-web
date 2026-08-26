import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  apiUrl = environment.base_url;
  private referralCodeSubject = new BehaviorSubject<string>('');
  referralCode$ = this.referralCodeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadReferralCodeFromUrl();
  }

  /**
   * Load referral code from URL parameters
   */
  loadReferralCodeFromUrl(): void {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        this.setReferralCode(ref);
      }
    }
  }

  /**
   * Set referral code in BehaviorSubject
   */
  setReferralCode(code: string): void {
    this.referralCodeSubject.next(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('referralCode', code);
    }
  }

  /**
   * Get referral code
   */
  getReferralCode(): string {
    return this.referralCodeSubject.value;
  }

  /**
   * Get referral code from localStorage if available
   */
  getStoredReferralCode(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('referralCode');
    }
    return null;
  }

  /**
   * Clear referral code
   */
  clearReferralCode(): void {
    this.referralCodeSubject.next('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('referralCode');
    }
  }

  /**
   * Validate referral code (check if it exists)
   */
  validateReferralCode(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}validate-referral-code`, {
      referral_code: code
    });
  }

  /**
   * Get user's referral code from profile
   */
  getUserReferralCode(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}user/${userId}/referral-code`);
  }

  /**
   * Get referral link
   */
  getReferralLink(referralCode: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}/register?ref=${referralCode}`;
    }
    return `/register?ref=${referralCode}`;
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject('Clipboard API not available');
  }
}
