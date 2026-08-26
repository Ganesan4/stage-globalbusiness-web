import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeComponent } from '../../../stripe_payment/stripe/stripe.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError, isEmpty } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { WebService } from '../../../services/web.service';
declare var paypal: any;

@Component({
  selector: 'app-upgrade-cart',
  standalone: true,
  imports: [CommonModule, StripeComponent],
  templateUrl: './upgrade-cart.component.html',
  styleUrl: './upgrade-cart.component.scss'
})
export class UpgradeCartComponent {

  userdetails: any;
  user_id: any;
  profileData: any = null;
  profileLoading = false;
  constructor(private router: Router, private http: HttpClient,private web: WebService) { }
  @Input() selectedItems: any[] = [];
  @Input() total: number = 0;
  @Output() resetCart = new EventEmitter<void>();
  selectedPayment: string = '';
  apiUrl = environment.base_url;
  showStripeModal = false;
  showPayPalModal = false;
  stripePaymentStatus: 'idle' | 'success' | 'error' = 'idle';
  stripePaymentMessage: string = '';
  // ✅ NEW STATES
  paymentStatus: 'idle' | 'success' | 'error' = 'idle';
  paymentMessage: string = '';
  ngOnInit() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
 this.user_id = localStorage.getItem('userId');
    console.log("User id:", this.user_id);
    if(this.user_id){
      this.myprofile();
    }
    // Only fetch user details if logged in; non-logged users can view the page
    if (isLoggedIn === 'true' && userId) {
      this.getAllRegister(userId);
    }
  }

  handleStripeResult(event: any) {

    if (event.status === 'success') {
      this.stripePaymentStatus = 'success';
      this.stripePaymentMessage =
        'Thank you for your upgrade purchase. Our team will activate your upgrades shortly.';
    } else {
      this.stripePaymentStatus = 'error';
      this.stripePaymentMessage = 'Payment failed. Please try again.';
    }
  }
  async myprofile() {
    if (!this.user_id) {
      return;
    }
    this.profileLoading = true;
    try {
      const res = await this.web.postData('myprofile', { userid: this.user_id });
      if (res?.status && res.message) {
        this.profileData = res.message;
        if (!this.userdetails) {
          this.userdetails = { email: this.profileData.email };
        } else if (this.profileData.email) {
          this.userdetails.email = this.profileData.email;
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.profileLoading = false;
    }
  }

  getBusinessInitial(): string {
    const name = this.profileData?.business_name?.trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getAllRegister(userId: string) {
    this.http.get<any[]>(`${this.apiUrl}getuserdetails/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching getAllregister:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {


          const filteredObject = data;
          if (filteredObject) {
            console.log("Object with id 177:", filteredObject);
            this.userdetails = filteredObject;
          }

          console.log("userdetails", this.userdetails);
          console.log("User Email:", this.userdetails.email);
        },
        error: (err) => {
          console.error("API Error:", err);
          this.userdetails = '';
        }
      });
  }
  // STRIPE
  openStripeModal() {
    if (this.total <= 0) {
      alert('Please select upgrades before payment');
      return;
    }

    this.selectedPayment = 'stripe';
    this.showStripeModal = true;
  }
handleStripeClose(status: any) {

  this.showStripeModal = false;

  // ✅ Reload ONLY if payment success
  if (status === 'success') {
    window.location.reload();
  }

}
  // PAYPAL
  openPayPalModal() {
    if (this.total <= 0) {
      alert('Please select upgrades before payment');
      return;
    }

    this.selectedPayment = 'paypal';
    this.showPayPalModal = true;

    // reset state
    this.paymentStatus = 'idle';
    this.paymentMessage = '';

    setTimeout(() => {
      this.loadPayPalScript();
    }, 0);
  }

  closePayPalModal() {
    this.showPayPalModal = false;
  }

  loadPayPalScript(): void {
    const scriptUrl = 'https://www.paypal.com/sdk/js?client-id=AW2ubpphZ_o87bOhdZZaBLnq5VkWlmL3Lc_Zr6gtoi8CPcuvF3_ZCC_nAmIguK_u-nxSrf5BxAzsCS3g&currency=USD';

    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.onload = () => this.initPayPal();
      document.body.appendChild(script);
    } else {
      this.initPayPal();
    }
  }

  initPayPal() {
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    paypal.Buttons({

      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.total.toFixed(2)
            }
          }]
        });
      },

      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.paymentStatus = 'success';
          this.paymentMessage = 'Thank you for your upgrade purchase. Our team will activate your upgrades shortly.';
          const userId = localStorage.getItem('userId');


          const planNames = this.selectedItems.map(i => i.name).join(', ');


          const payload = {
            upgrade_plan: planNames,
            amount: this.total,
            transaction_id: details.id,
            user_id: userId,
            email: this.userdetails?.email,
            created_by: "user",
          };

          this.http.post(`${this.apiUrl}saveUpgradePayment`, payload)
            .subscribe({
              next: (res) => {
                console.log("Payment saved:", res);

                // ✅ Call referral commission update API
                this.updateReferralCommission(this.total);

                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              },
              error: (err) => {
                console.error("Save payment error:", err);
              }
            });

        });

      },

      onError: (err: any) => {
        console.error(err);

        this.paymentStatus = 'error';
        this.paymentMessage = 'Please try again.';
      }

    }).render('#paypal-button-container');
  }

  /**
   * Update referral commission after successful payment
   */
  updateReferralCommission(amount: number): void {
    const userId = localStorage.getItem('userId');
    const referrerId = this.getReferrerId(this.userdetails);

    if (!referrerId) {
      this.fetchProfileAndUpdateReferralCommission(amount, userId);
      return;
    }

    this.postReferralCommission(referrerId, amount, userId);
  }

  private fetchProfileAndUpdateReferralCommission(amount: number, userId: string | null): void {
    if (!userId) {
      console.log('No user id found, skipping referral commission update');
      return;
    }

    this.http.post<any>(`${this.apiUrl}myprofile`, { userid: userId })
      .subscribe({
        next: (profileRes) => {
          const profile = profileRes?.message || profileRes?.data || profileRes;
          const referrerId = this.getReferrerId(profile);

          // Still call API even without referrerId — backend will look it up from validation records
          this.postReferralCommission(referrerId ?? null, amount, userId);
        },
        error: (err) => {
          console.error('Error fetching profile for referral commission update:', err);
          // Try without referrer_id as last resort
          this.postReferralCommission(null, amount, userId);
        }
      });
  }

  private postReferralCommission(referrerId: number | string | null, amount: number, userId: string | null): void {
    const payload: any = {
      amount: amount,
      user_id: userId,
      upgrade_plan: this.selectedItems.map(i => i.name).join(', '),
    };
    if (referrerId !== null && referrerId !== undefined) {
      payload.referrer_id = referrerId;
    }

    this.http.post(`${this.apiUrl}update-referral-commission`, payload)
      .subscribe({
        next: (res) => {
          console.log("Referral commission updated:", res);
        },
        error: (err) => {
          console.error("Error updating referral commission:", err);
          // Don't block user experience if this fails
        }
      });
  }

  private getReferrerId(source: any): number | string | null {
    if (!source) {
      return null;
    }

    // ✅ Referral priority rule:
    // If referred_by is null, fall back to referred_by_affiliate.
    const referredBy = source?.referred_by;
    if (referredBy !== undefined && referredBy !== null && referredBy !== '') {
      return referredBy;
    }

    const referredByAffiliate = source?.referred_by_affiliate;
    if (referredByAffiliate !== undefined && referredByAffiliate !== null && referredByAffiliate !== '') {
      return referredByAffiliate;
    }

    // Other legacy fallbacks (kept for backward compatibility)
    const legacyReferrerId =
      source?.referred_by_id ??
      source?.referrer_id ??
      source?.refferer_id ??
      source?.referrerId ??
      source?.referral_user_id;

    if (legacyReferrerId === undefined || legacyReferrerId === null || legacyReferrerId === '') {
      return null;
    }

    return legacyReferrerId;
  }
}
