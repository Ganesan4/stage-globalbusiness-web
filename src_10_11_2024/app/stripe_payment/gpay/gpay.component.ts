import { Component, EventEmitter, Output } from '@angular/core';
import { GooglePayButtonModule } from '@google-pay/button-angular';
import { WebService } from '../../services/web.service';

@Component({
  selector: 'app-gpay',
  standalone: true,
  imports: [GooglePayButtonModule],
  templateUrl: './gpay.component.html',
  styleUrl: './gpay.component.scss'
})
export class GpayComponent {
  constructor(private web: WebService){}

  @Output('transactionGpay') transactionGpay = new EventEmitter();

  paymentRequest: google.payments.api.PaymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA']
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'example',  
          gatewayMerchantId: 'exampleidd'
        }
      }
    }],
    merchantInfo: {
      merchantId: 'BCR2DN4T2OOKRSZP', 
      merchantName: 'Global Business Pages'
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: "Total",
      totalPrice: '102.00',
      currencyCode: 'USD',
      countryCode: 'US'
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION'],
    shippingAddressRequired: true
  };

  // async onLoadPaymentData(event: any) {
  //   // Handle the successful payment data here
  //   try{
  //     const res = await this.web.postData('gpay',event.detail)
  //       if(res){
  //         console.log('resultt',res);
  //       }
  //   } catch(err){
  //     console.log(err);
  //   }
  //   console.log('Load payment data', event.detail);
  // }

  onLoadPaymentData = async (
    event: Event
  ): Promise<void> => {
    const eventDetail = event as CustomEvent<google.payments.api.PaymentData>;
    try{
          const amount = this.paymentRequest.transactionInfo.totalPrice
          const currency = this.paymentRequest.transactionInfo.currencyCode
          const res = await this.web.postData('gpay',{event :eventDetail.detail, amount: amount, currency: currency})
            if(res){
              console.log('resultt',res);
              this.onGpayComplete(res);

              setTimeout(() => {
                this.onClose();
              }, 10000)
            }
        } catch(err){
          console.log(err);
        }
    // console.log('load payment data', eventDetail.detail);
  }

  onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = (
    paymentData
    ) => {
      console.log('payment authorized', paymentData);
      return {
        transactionState: 'SUCCESS'
      };
    }

  onError = (event: ErrorEvent): void => {
    console.error('error', event.error);
  }

  onGpayComplete(status) {
    console.log({status}, "onGpayComplete");
    this.transactionGpay.emit(status);
  }


  @Output() onCloseEvent = new EventEmitter<String>();
  onClose() {
    this.onCloseEvent.emit('close');
  }


}
