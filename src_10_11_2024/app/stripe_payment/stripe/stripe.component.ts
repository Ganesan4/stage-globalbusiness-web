import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
  imports: [NgxStripeModule, ReactiveFormsModule, StripeCardNumberComponent,FormsModule, CommonModule],
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.scss']
})
export class StripeComponent implements OnInit {
  @ViewChild(StripeCardNumberComponent) card: StripeCardNumberComponent;

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

  stripeTest: FormGroup;
  // msg: string;
  error: { code: string; message: string } = { code: '', message: '' };
  success: { code: boolean; message: string } = { code: false, message: '' };;
  apiUrl = environment.base_url;
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private stripeService: StripeService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.stripeTest = this.fb.group({
      name: ['mahi', [Validators.required]],
      amount: [1000, [Validators.required, Validators.pattern(/^\d+$/)]], // Corrected pattern for numeric input
    });
  }

  pay(): void {
    if (this.stripeTest.valid) { 
      const amount = this.stripeTest.get('amount').value;
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
            console.log("result",result);
            
            if (result.error) {
              // Handle error here
              this.error.code = result.error.code;
              this.error.message = result.error.message;
              console.error('Payment failed:', result.error.message);
            } else {
              // Payment succeeded
              this.error.code = '';
              this.error.message = '';
              this.success.code = true;  
              this.success.message = 'Payment succeeded!';
              setTimeout(() => {
                this.success.message = '';
                this.onClose();
              }, 1000);
              this.paymentService.announcePaymentSuccess(result);
              console.log('Payment succeeded!');
            }
          },
          error: (err) => {
            console.error('Error occurred:', err); 
          },
        });
    } else {
      console.error('Form is invalid', this.stripeTest);
    }
  }

  @Output() onCloseEvent = new EventEmitter<String>();
  onClose() {
    this.onCloseEvent.emit('close');
  }

  createPaymentIntent(amount: number): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(
      `${this.apiUrl}create-payment-intent`,
      { amount: amount }
    );
  }
  
}
