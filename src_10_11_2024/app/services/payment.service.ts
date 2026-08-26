import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private paymentSuccessSource = new Subject<any>(); 

  paymentSuccess$ = this.paymentSuccessSource.asObservable(); 

  
  announcePaymentSuccess(paymentData: any) {
    this.paymentSuccessSource.next(paymentData);
    console.log("this.paymentSuccessSource.next(paymentData)",this.paymentSuccessSource.next(paymentData));
    
  }
}
