import { Component, OnInit,inject ,Renderer2, Output, EventEmitter } from '@angular/core';
import { StripeComponent } from '../stripe_payment/stripe/stripe.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators,AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { StripeCardNumberComponent ,StripeService } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions, PaymentIntent } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import e from 'express';
import { PaymentService } from '../services/payment.service';
import { GpayComponent } from "../stripe_payment/gpay/gpay.component";
import { WebService } from '../services/web.service';

Injectable({
  providedIn: 'root'
})
declare var Square: any;
declare var paypal: any;
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, StripeComponent, GpayComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements  OnInit  {
  apiUrl = environment.base_url;
  registerForm: FormGroup;
  step = 1;
  selectedPayment: string | null = null;
  isSubmitted = false;
  showSquareModal: boolean = false;
  showModal = false;
  selectedAmenityTitle: string = '';
  selectedCategory: string = '';
  description: string = '';
  isFree: boolean = false;
  cost: number | null = null;
  showOkButton: boolean = false;
  showPayPalModal: boolean = false;
  showStripeModal: boolean = false;
  showGpayModal: boolean = false;
  transactionGpayStatus: String = '';
  transactionSuccessGpay :boolean = false;
  transactionSuccessStripe :boolean = false;
  data: any;
  payments: any;
  response:any;
  card: any;
  cardButton: HTMLButtonElement | null = null;
  statusContainer: HTMLElement | null = null;
  existingEmails: string[] = [];
  stepLabels = ['Basic Info', 'Products & Services', 'Support', 'Final Details'];
  newfilename: string;
  amount: any;
  currency: any;
  transaction_id: any;
  payment_options: any;
  transaction_date: any;
  transactionSuccess: boolean=false;
  transactionSuccessPaypal: boolean=false;
  showValidationPayment: boolean=false;
  responseregister: any;
  details: any;
  showsuccessmessage: boolean=false;
  amenities: any[] = []
  countries: { name: string; code: string }[] = [];

  onPaymentSuccess(paymentStatus: any) {
    console.log('payyyyy',paymentStatus)
    this.payment_options='Gpay';
    this.transactionGpayStatus = paymentStatus.paymentStatus
    this.transactionSuccessGpay = true;
    this.transaction_id = paymentStatus.transaction_id;
    this.transaction_date = paymentStatus.transaction_date;
    this.currency = paymentStatus.currency;
    this.amount = paymentStatus.amount;
    
    this.registerForm.get('transaction_id')?.setValue(this.transaction_id);
    this.registerForm.get('transaction_date')?.setValue(this.transaction_date);
    this.registerForm.get('currency')?.setValue(this.currency);
    this.registerForm.get('amount')?.setValue(this.amount);
    this.registerForm.get('payment_options')?.setValue(this.payment_options);
    console.log('transaction_id',this.transaction_id)
    setTimeout(() => {
      this.transactionSuccessGpay = false;
      this.showGpayModal = false;
    }, 1000);
  }

  constructor(private fb: FormBuilder,
     private paymentService: PaymentService,
     private renderer: Renderer2,
     private http: HttpClient,
    private web: WebService,) {
   
    this.registerForm = this.fb.group({
      businessName: ['', Validators.required],
      logo: [null],
      files: [null], 
      tagline: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),Validators.email]],
      fax: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmpassword: ['', Validators.required],
      currency: [''],
      website: [''],
      country: ['', Validators.required],
      region: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      productsServices: ['', Validators.required],
      pricing: [''],
      transaction_id:[''],
      startDate: [''],
      annualSales: [''],
      industry: [''],
      amount: [''],
      operatingHours: [''],
      locationDetails: [''],
      serviceAreas: [''],
      targetMarket: [''],
      socialMediaLinks: [''],
      certifications: [''],
      paymentOptions: ['', Validators.required],
      clientTestimonials: [''],
      caseStudies: [''], 
      marketPositioning: [''], 
      globalReach: [''], 
      sustainabilityPractices: [''],
      newsUpdates: [''], 
      promotions: [''], 
      networkingOpportunities: [''], 
      visualContent: [''], 
      communityInvolvement: [''], 
      faq: [''], 
      callToAction: [''], 
      mobileFriendlyFeatures: [''], 
      legalInformation: [''], 
      uvp: [''], 
      multilingualSupport: [''],
      customerSatisfaction: [''], 
      employeeSatisfaction: [''], 
      socialImpactScores: [''], 
      operationalTransparency: [''], 
      industryComparisons: [''], 
      uspAnalysis: [''], 
      transaction_date: [''], 
      productLifecycle: [''], 
      communityEngagement: [''], 
      visualInteractive: [''], 
      userGeneratedQA: [''], 
      dynamicPricing: [''], 
      expertOpinions: [''], 
      crisisManagement: [''],
      amenities: this.fb.array([]),
      // amenities2: this.amenities,
      status: [0]
    },
    {
      validator: this.passwordMatchValidator
    });
  }


  ngOnInit(): void {
    this.countryCodeSelected();
    this.getAllRegister();
    console.log("Check Initialization");
    if (this.selectedPayment === 'paypal') {
      console.log("SelectedPaymentOnIntialize:", this.selectedPayment);
      this.loadPayPalScript();
    }
    if (this.selectedPayment === 'square') {
      console.log("SelectedPaymentOnIntialize:", this.selectedPayment);
      this.loadScript();
    }
    this.paymentService.paymentSuccess$.subscribe((paymentData) => {
      console.log('Payment success data received in RegisterComponent:', paymentData);
      this.payment_options='Stripe';
      this.amount = paymentData.paymentIntent.amount; 
      this.currency = paymentData.paymentIntent.currency; 
      this.transaction_id = paymentData.paymentIntent.id; 
      this.transaction_date = new Date(paymentData.paymentIntent.created * 1000); 
      this.registerForm.get('paymentOptions')?.setValue(this.payment_options);
      this.registerForm.get('transaction_id')?.setValue(this.transaction_id);
      this.registerForm.get('amount')?.setValue(this.amount);
      this.registerForm.get('currency')?.setValue(this.currency);
      this.registerForm.get('transaction_date')?.setValue(this.transaction_date);
     

      setTimeout(() => {
        this.transactionSuccessStripe=true;
        this.showStripeModal=false;
        
      }, 3000);  
      console.log("this.showStripeModal",this.showStripeModal);
      
    });
  }


  passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmpassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      console.log('Passwords do not match');
      return { mismatch: true };
    } else {
      return null;
    }
  }
  
  countryCodeSelected(){
    this.web.getData('getCountryCode').then((response: any) => {
      console.log("response12",response);
      this.countries = response;   
    })
  }

  onCountryChange(event: any): void {
    const selectedCountry = event.target.value;
    console.log("selectedCountry",selectedCountry);
    this.registerForm.get('country')?.setValue(selectedCountry);
  }
  

  loadPayPalScript(): void {
console.log('33333333333');

    const scriptUrl = 'https://www.paypal.com/sdk/js?client-id=AQ_WLaUUYGpIZET5U09_Z8klQNqxNeELmY3nOtaaTz6I04k8TgJ9V2HeMer6VR5z0KKdkQdtQ8MKj8wL&currency=USD'; 
    console.log('scriptUrl',scriptUrl);

    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      console.log('33333333333');
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => this.initializePayPal();
      document.body.appendChild(script);
    } else {
      this.initializePayPal(); 
    }
  }

  initializePayPal(): void {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '100.00' 
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('Transaction completed by ' + details.payer.name.given_name);
          this.payment_options='Paypal';
          this.amount = details.purchase_units[0].amount.value;
          this.currency = details.purchase_units[0].amount.currency_code; 
          this.transaction_id = details.purchase_units[0].payments.captures[0].id; 
          this.transaction_date = details.purchase_units[0].payments.captures[0].create_time;          
          this.registerForm.get('paymentOptions')?.setValue(this.payment_options);
          this.registerForm.get('transaction_id')?.setValue(this.transaction_id);
          this.registerForm.get('amount')?.setValue(this.amount);
          this.registerForm.get('currency')?.setValue(this.currency);
          this.registerForm.get('transaction_date')?.setValue(this.transaction_date);
          this.transactionSuccessPaypal = true;

          
          setTimeout(() => {
            this.showPayPalModal = false;
            this.transactionSuccessPaypal = false;  
          }, 1000);  
        });
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
      }
    }).render('#paypal-button-container');
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log("Selected file:", this.selectedFile);

      const formData = new FormData();

      // Generate a random number for the filename
      const randomNumber = Math.floor(Math.random() * 1000000);
      const fileExtension = file.name.split('.').pop(); // Get the file extension
      const newFileName = `Globalbusiness_${randomNumber}.${fileExtension}`; // New filename format
      this.newfilename=newFileName;
      // Append the file (logo) to the FormData with the new filename
      formData.append('logo', file, newFileName); // Use new filename
      
      // Send the file to the backend
      this.http.post(`${this.apiUrl}save-logo`, formData)
      .subscribe(
        response => {
          console.log('uploaded image', response);
         
        },
        error => {
          console.error('Error occurred while saving data', error);
          // Handle error response
        }
      );
    }
  }
  selectedFile(arg0: string, selectedFile: any) {
    throw new Error('Method not implemented.');
  }
  
  onSubmit() {
    // this.isSubmitted = true;
    
    console.log("this.selectedPayment",this.selectedPayment);
    
    if(this.selectedPayment == null){
      this.showValidationPayment = true;
      console.log("123");
      
          }
          else if(this.selectedPayment != null) {
            console.log("456");
        if (this.registerForm.valid) {
     console.log("this.newfilename",this.newfilename);
    
      this.registerForm.get('logo')?.setValue(`${this.apiUrl}uploads/register_logo/${this.newfilename}`);
      console.log("this.registerForm.value",this.registerForm.value);
      this.http.post( `${this.apiUrl}save-registration`, this.registerForm.value)
      .subscribe(
        response => {
          console.log('Registration successful', response);
          this.showsuccessmessage = true;
          console.log("this.showsuccessmessage",this.showsuccessmessage);
            this.details=response
          if (this.details.status) {
            this.showsuccessmessage = true;
            console.log("this.showsuccessmessage",this.showsuccessmessage);
            
            this.isSubmitted = false; 
            this.responseregister = response;
            this.showsuccessmessage=true;
          console.log("this.responseregister.data.email",this.responseregister.data.email);
          
            
            const payload = { data: this.responseregister.data };
           
            this.http.post(`${this.apiUrl}sendmailregister`, payload, {
              headers: {
                'Content-Type': 'application/json' 
              }
            }).subscribe(
              response => {
                console.log("Email sent successfully", response);
              },
              error => {
                console.error("Error sending email:", error);
              }
            );
          }
          
            
            this.registerForm.reset();
            this.isSubmitted = false;
        },
        error => {
          console.error('Error occurred while saving data', error);
          // Handle error response
        }
      );
     
    } else {
      console.log('Form is invalid');
    }
  
    
  }
  }


  selectPayment(option: string) {
    this.selectedPayment = option;
    console.log("SelectedPayment:", this.selectedPayment);
    this.registerForm.get('paymentOptions')?.setValue(option); 
    this.showValidationPayment = false; 
    if (this.selectedPayment === 'paypal') {
      this.openPayPalModal();
    }
    if (this.selectedPayment === 'stripe') {
      this.openStripeModal();
    }
    if (this.selectedPayment === 'square') {
      this.openSquareModal();
    }
    if (this.selectedPayment === 'gpay') {
      this.openGpayModal();
    }
  }
  openSquareModal() {
    this.showSquareModal = true;
    this.loadScript();
  }

  onCancelSquare() {
    this.showSquareModal = false;
    const squareButtonContainer = document.getElementById('square-button-container');
    if (squareButtonContainer) {
      squareButtonContainer.innerHTML = ''; 
    }
  }
  openPayPalModal() {
    console.log("paypal open");

    this.showPayPalModal = true;

    // Clear the PayPal button container before rendering again
    setTimeout(() => {
      const paypalButtonContainer = document.getElementById('paypal-button-container');
      if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = ''; // Clear any previous PayPal button if exists
      }
      this.loadPayPalScript(); // Load and render PayPal buttons
    }, 0); // Small delay to ensure DOM is updated
}

onCancelPayPal() {
    this.showPayPalModal = false;

    // Optionally clear the PayPal button container on cancel
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer) {
      paypalButtonContainer.innerHTML = ''; // Clear PayPal button
    }
}
    openStripeModal(){
      this.showStripeModal = true;
      // this.loadStripeScript();
    }

    onCancelStripe() {
      this.showStripeModal = false;
    }

    openGpayModal() {
      this.showGpayModal = true;  
    }
    onCancelGpay() {
      this.showGpayModal = false;
    }
  
  isAmenitySelected(amenity: string): boolean {
    const amenitiesArray = this.registerForm.get('amenities') as FormArray;
    console.log("1.amenitiesArray",amenitiesArray)
    return amenitiesArray.value.includes(amenity);  
  }

  onAmenityClick(title: string, event: Event, category: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const amenitiesArray = this.registerForm.get('amenities') as FormArray;
    console.log("2.amenitiesArray",amenitiesArray)

    if (isChecked) {
      // amenitiesArray.push(new FormControl(title)); 
      this.selectedAmenityTitle = title;
      this.selectedCategory = category; 
      this.showModal = true; 
    } else {
      // this.amenities = this.amenities.filter(item => item.title !== title);
      const index = amenitiesArray.controls.findIndex(x => x.value); 
      if (index > -1) {
        amenitiesArray.removeAt(index);
        // amenitiesArray.removeAt(index + 1);  
      }
      this.showModal = false; 
    }
  }
  

    onToggleCost() {
      this.showOkButton = this.isFree || (this.cost !== null && this.cost > 0);
      if (this.isFree) {
        this.cost = null; 
      }
    }

    onAmountChange() {
      this.showOkButton = this.cost !== null && this.cost > 0;
    }
  
    onOk() {
      const amenity = this.fb.group({
        title: this.selectedAmenityTitle,
        description: this.description,
        isFree: this.isFree,
        cost: this.isFree ? 0 : this.cost, 
        category: this.selectedCategory
      });
      // const amenity2 = {
      //   title: this.selectedAmenityTitle,
      //   description: this.description,
      //   isFree: this.isFree,
      //   cost: this.isFree ? 0 : this.cost,
      //   category: this.selectedCategory
      // };

      // this.amenities.push(amenity2);
      (this.registerForm.get('amenities') as FormArray).push(amenity);
    
      console.log(this.registerForm);
  
      this.closeModal();
    }
  
    closeModal() {
      this.showModal = false;
      this.isFree = false;        
      this.cost = null;           
      this.description = '';      
      this.showOkButton = false;  
    }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return !!this.registerForm.get('businessName')?.valid &&
               !!this.registerForm.get('country')?.valid &&
               !!this.registerForm.get('phone')?.valid &&
               !!this.registerForm.get('email')?.valid &&
               !!this.registerForm.get('password')?.valid &&
               !!this.registerForm.get('confirmpassword')?.valid &&
               !!this.registerForm.get('category')?.valid &&
               !!this.registerForm.get('description')?.valid &&
               !!this.registerForm.get('productsServices')?.valid &&
               !!this.registerForm.get('region')?.valid &&
               !!this.registerForm.get('state')?.valid &&
               !!this.registerForm.get('city')?.valid &&
               !!this.registerForm.get('zipCode')?.valid;
               
      case 2:
        return true;
      case 3:
        return true; 
      case 4:
        return true; 
      default:
        return true;
    }
  }
  
  nextStep() {
    if (this.isStepValid(this.step) && this.step < 4) {
      this.step++;
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  isNextDisabled(): boolean {
    return !this.isStepValid(this.step);
  }

  getAllRegister() {
    this.http.get(`${this.apiUrl}getOverAllregister`)
      .subscribe(
        response => {
          // console.log('getallregisterdata', response);
          const data = response['data'];
          this.existingEmails = data.map((item: any) => item.email); // Extract emails
          this.applyEmailValidator();
        },
        error => {
          console.error('Error occurred while fetching data', error);
          
        }
      );
  }

  
  emailExistsValidator(existingEmails: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; 
      }
      const emailExists = existingEmails.includes(control.value);
      return emailExists ? { 'emailExists': true } : null; 
    };
  }

  applyEmailValidator() {
    const emailControl = this.registerForm.get('email');
    if (emailControl) {
      emailControl.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),
        Validators.email,
        this.emailExistsValidator(this.existingEmails) // Apply the custom validator
      ]);
      emailControl.updateValueAndValidity(); // Update form validation
    }
  }
 
  // async  loadScript() {
   
   
  //   // Your SqPaymentForm script here
  
  //   var applicationId = "sandbox-sq0idb-O6e2c7juXuf9P0_gSYn32A";
  
  //   // Set the location ID
  //   var locationId = "LQC04P5CAFGVD";
  
  //   this.payments = Square.payments(applicationId, locationId);
  
  //   this.card = await this.payments.card();
  
  //   await this.card.attach('#card-container');
  
  //   this.cardButton = document.getElementById('card-button') as HTMLButtonElement;
  //   this.statusContainer = document.getElementById('payment-status-container') as HTMLElement; // the card nonce
  
  //   const form = document.querySelector('#card-payment') as HTMLFormElement;
  
  //   form.addEventListener('submit', async (event: Event) => {
  
  //      event.preventDefault();
  
  //      const result = await this.card.tokenize(); // the card nonce
  
  //   });
  //   console.log("result");
  //   // onCancel: () => {
  //   //   this.common.presentToast('Payment cancelled.');
  //   //   console.log("OnCancel");
  //   // }
    
  // }

  loadScript() {
    console.log("Loading script...");
    const script = this.renderer.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true; 
    script.onerror = () => {
      console.error('Failed to load the Square script');
    };
    script.onload = async () => {
      console.log('Script loaded successfully');

      if (typeof Square === 'undefined') {
        console.error('Square is not defined after script load');
        return;
      }

      const applicationId = "sandbox-sq0idb-njBgtuXFMDflZxobPrR7Jg";
      const locationId = "L8KFYVYEZHHHX";
      this.payments = Square.payments(applicationId, locationId);
      this.card = await this.payments.card();
      this.card.attach('#card-container');

      this.cardButton = document.getElementById('card-button') as HTMLButtonElement;
      this.statusContainer = document.getElementById('payment-status-container') as HTMLElement;

      const form = document.querySelector('#card-payment') as HTMLFormElement;

      form.addEventListener('submit', async (event: Event) => {
        event.preventDefault();
        const result = await this.card.tokenize();
        // Handle the result here
      });
    };

    // Append the script to the document body
    this.renderer.appendChild(document.body, script);
  }

  async getregisterdetails() {
    try {
      console.log("entereddddddd")
     
      this.http.get(
        `${this.apiUrl}getOverAllregister`)
      .subscribe(
        (res) => {
          this.response = res; 
          console.log("getresponse for register",this.response);
          
         
        },
        (err) => {
          console.error('Error response from API:', err);  
        }
      );
     
    } catch (error) {
      console.error('Error from backend:', error);
    }
  }
  async sendPaymentToBackend() {
    
    this.statusContainer = document.getElementById('payment-status-container');
    const result = await this.card.tokenize();
    console.log("result.token", result.token);

    if (!result.token) {
        console.error('Tokenization failed.');
        return;
    }

    try {
       
      this.http.post(
        `${this.apiUrl}process-payment`, 
        { token: result.token }, 
        {
          headers: { 'Content-Type': 'application/json' } 
        }
      )
      .subscribe(
        (res) => {
          this.response = res; 
          console.log("this.response.paymentId.payment.total_money.amount",this.response.paymentId.payment.total_money.amount);      
          this.amount = this.response.paymentId.payment.total_money.amount;
          this.currency = this.response.paymentId.payment.total_money.currency;
          this.transaction_id = this.response.paymentId.payment.order_id;
          this.transaction_date = this.response.paymentId.payment.created_at;
          this.payment_options='Square';
          this.registerForm.get('paymentOptions')?.setValue(this.payment_options);
          this.registerForm.get('transaction_id')?.setValue(this.transaction_id);
          this.registerForm.get('amount')?.setValue(this.amount);
          this.registerForm.get('currency')?.setValue(this.currency);
          this.registerForm.get('transaction_date')?.setValue(this.transaction_date);
          
          console.log(this.response, "Payment successful");  

          this.transactionSuccess = true;

          
          setTimeout(() => {
            this.showSquareModal = false;
            this.transactionSuccess = false;  
          }, 1000);  
        },
        (err) => {
          console.error('Error response from payment API:', err);  
        }
      );
     
    } catch (error) {
      console.error('Error sending payment to backend:', error);
    }
}

}