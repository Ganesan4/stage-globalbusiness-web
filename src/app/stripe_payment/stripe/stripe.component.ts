




import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';
import { StripeService, StripeCardNumberComponent, NgxStripeModule } from 'ngx-stripe';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
  PaymentIntent,
} from '@stripe/stripe-js';

import { environment as env, environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stripe',
  standalone: true,
  imports: [NgxStripeModule, ReactiveFormsModule, StripeCardNumberComponent, FormsModule, CommonModule],
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.scss']
})
export class StripeComponent implements OnInit {
  @ViewChild(StripeCardNumberComponent) card: StripeCardNumberComponent;

  @Input() strname: string;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en', // Changed locale from 'es' to 'en' for default English
  };
  paymentStatus: 'idle' | 'success' | 'error' = 'idle';
  paymentMessage: string = '';
  isProcessing: boolean = false;
  @Input() upgradeAmount: number = 0;
  @Input() selectedItems: any[] = [];
  @Input() isUpgradePayment: boolean = false;
  @Input() userDetails: any = null;
  stripeTest: FormGroup;
  // msg: string;
  error: { code: string; message: string } = { code: '', message: '' };
  success: { code: boolean; message: string } = { code: false, message: '' };;
  apiUrl = environment.base_url;
  @Output() paymentResult = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private stripeService: StripeService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    console.log("this.strname", this.strname);
    // this.strname="teststripe@gmail.com";
    this.stripeTest = this.fb.group({
      name: [this.strname, [Validators.required]],
      amount: [130, [Validators.required, Validators.pattern(/^\d+$/)]], // Corrected pattern for numeric input
    });
  }

  // pay(): void {
  //   if (this.stripeTest.valid) { 
  //     const amount = this.stripeTest.get('amount').value;
  //      console.log("test");
  //     this.createPaymentIntent(amount)
  //       .pipe(
  //         switchMap((paymentIntent) =>



  //           this.stripeService.confirmCardPayment(paymentIntent.client_secret, { 

  //             payment_method: {
  //               card: this.card.element,
  //               billing_details: {
  //                 name: this.stripeTest.get('name').value,
  //               },
  //             },
  //           })
  //         )
  //       )
  //       .subscribe({
  //         next: (result) => {
  //           console.log("result",result);

  //           if (result.error) {
  //             // Handle error here
  //             this.error.code = result.error.code;
  //             this.error.message = result.error.message;
  //             console.error('Payment failed:', result.error.message);
  //           } else {
  //             // Payment succeeded
  //             this.error.code = '';
  //             this.error.message = '';
  //             this.success.code = true;  
  //             this.success.message = 'Payment succeeded!';
  //             setTimeout(() => {
  //               this.success.message = '';
  //               this.onClose();
  //             }, 1000);
  //             this.paymentService.announcePaymentSuccess(result);
  //             console.log('Payment succeeded!');
  //           }
  //         },
  //         error: (err) => {
  //           console.error('Error occurred:', err); 
  //         },
  //       });
  //   } else {
  //     console.error('Form is invalid', this.stripeTest);
  //   }
  // }
  pay(): void {

    if (this.stripeTest.valid) {
      this.isProcessing = true;
      this.error = { code: '', message: '' };
      this.paymentStatus = 'idle';
      this.paymentMessage = '';

      // ✅ USE UPGRADE AMOUNT IF AVAILABLE
      const amount = this.isUpgradePayment
        ? this.upgradeAmount * 100
        : this.stripeTest.get('amount').value;

      this.createPaymentIntent(amount)
        .pipe(
          switchMap((paymentIntent) =>
            this.stripeService.confirmCardPayment(paymentIntent.client_secret, {
              payment_method: {
                card: this.card.element,
                billing_details: {
                  name: this.stripeTest.get('name').value,
                },
              },
            })
          )
        )
        .subscribe({
          next: (result) => {
            this.isProcessing = false;
            if (result.error) {
              this.showCardError(result.error);
              this.paymentResult.emit({
                status: 'error',
                message: this.error.message,
                error: result.error
              });
              return;
            }

            this.success.code = true;
            this.success.message = 'Payment succeeded!';

            if (this.isUpgradePayment) {
              this.handleUpgradePayment(result);
            } else {
              this.paymentStatus = 'success';
              this.paymentMessage = 'Payment successful.';
              this.paymentResult.emit({
                status: 'success',
                result
              });
            }

            this.paymentService.announcePaymentSuccess(result);
          },
          error: (err) => {
            this.isProcessing = false;
            this.showCardError({
              code: err?.error?.code || 'payment_error',
              message: err?.error?.message || err?.error?.error || err?.message || ''
            });
            this.paymentResult.emit({
              status: 'error',
              message: this.error.message,
              error: err
            });
            console.error('Error occurred:', err);
          },
        });

    }
    else {
      this.showCardError({
        code: 'incorrect_details',
        message: 'Please fill the correct details.'
      });
    }
  }

  handleUpgradePayment(result: any) {

    const userId = localStorage.getItem('userId');

    const planNames = this.selectedItems.map(i => i.name).join(', ');

    const payload = {
      upgrade_plan: planNames,
      amount: this.upgradeAmount,
      transaction_id: result?.paymentIntent?.id || 'stripe_txn',
      user_id: userId,
      email: this.userDetails?.email || this.stripeTest.get('name').value,
      created_by: "user",

    };

    this.http.post(`${this.apiUrl}saveUpgradePayment`, payload)
      .subscribe({
        next: (res) => {

          // ✅ SHOW SUCCESS UI
          this.paymentStatus = 'success';
          this.paymentMessage =
            'Thank you for your upgrade purchase. Our team will activate your upgrades shortly.';
          this.paymentResult.emit({
            status: 'success',
            result,
            response: res
          });

          // ✅ Update referral commission after successful payment
          this.updateReferralCommission(this.upgradeAmount);

          console.log("Stripe Upgrade Payment Saved:", res);

        },
        error: (err) => {

          // ❌ SHOW ERROR UI
          this.paymentStatus = 'error';
          this.paymentMessage =
            'Payment was processed, but we could not save the upgrade details. Please contact support.';
          this.paymentResult.emit({
            status: 'error',
            message: this.paymentMessage,
            result,
            error: err
          });

          console.error("Stripe Save Error:", err);
        }
      });
  }

  /**
   * Update referral commission after successful payment
   */
  updateReferralCommission(amount: number): void {
    const userId = localStorage.getItem('userId');
    const referrerId = this.getReferrerId(this.userDetails);

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
  @Output() onCloseEvent = new EventEmitter<String>();
  onClose() {
    this.onCloseEvent.emit(this.paymentStatus);
  }
  onCancel() {

    this.onCloseEvent.emit(this.paymentStatus);

  }

  createPaymentIntent(amount: number): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(
      `${this.apiUrl}create-payment-intent`,
      { amount: amount }
    );
  }

  private showCardError(error: any): void {
    this.paymentStatus = 'idle';
    this.error.code = error?.code || 'card_error';
    this.error.message = this.getFormErrorMessage(error);
  }

  private getFormErrorMessage(error: any): string {
    const declineCode = (error?.decline_code || '').toLowerCase();
    const message = error?.message || '';
    const msg = message.toLowerCase();
    const liveTestCardMessage =
      'Your card was declined. Your request was in live mode, but used a known test card.';

    if (
      declineCode === 'live_mode_test_card' ||
      msg.includes('known test card')
    ) {
      return liveTestCardMessage;
    }

    if (this.isIncompleteCardError(error?.code) || error?.code === 'incorrect_details') {
      return 'Please fill the correct details.';
    }

    return message || 'Please fill the correct details.';
  }

  private isIncompleteCardError(code: string): boolean {
    return [
      'incomplete_number',
      'incomplete_expiry',
      'incomplete_cvc',
      'incomplete'
    ].includes(code || '');
  }

}
