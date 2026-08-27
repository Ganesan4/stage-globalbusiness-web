import { Component, OnInit, inject, Renderer2, Output, EventEmitter } from '@angular/core';
import { StripeComponent } from '../stripe_payment/stripe/stripe.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { StripeCardNumberComponent, StripeService } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions, PaymentIntent } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import e from 'express';
import { PaymentService } from '../services/payment.service';
import { ReferralService } from '../services/referral.service';
import { GpayComponent } from "../stripe_payment/gpay/gpay.component";
import { WebService } from '../services/web.service';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { state } from '@angular/animations';
import { ListingDataService } from '../services/listingData.service';

Injectable({
  providedIn: 'root'
})
declare var Square: any;
declare var paypal: any;
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, StripeComponent, GpayComponent, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
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
  transactionSuccessGpay: boolean = false;
  transactionSuccessStripe: boolean = false;
  data: any;
  payments: any;
  response: any;
  card: any;
  cardButton: HTMLButtonElement | null = null;
  statusContainer: HTMLElement | null = null;
  existingEmails: string[] = [];
  stepLabels = ['Basic Info', 'Login Details'];
  newfilename: string;
  amount: any;
  stripeName: any;
  currency: any;
  transaction_id: any;
  payment_options: any;
  transaction_date: any;
  transactionSuccess: boolean = false;
  transactionSuccessPaypal: boolean = false;
  showValidationPayment: boolean = false;
  showToast = false;
  responseregister: any;
  details: any;
  showsuccessmessage: boolean = false;
  amenities: any[] = []
  countries: { name: string; iso2: string; iso3: string }[] = [];
  states: { name: string; state_code: string }[] = [];
  existData: any;
  name: string = '';  // Default name
  showQrCodeModal: boolean = false;
  screenshotPreview: string | ArrayBuffer | null = null;
  referralCode: string = '';
  referralCodeValidationStatus: 'valid' | 'invalid' | 'checking' | null = null;
referralWarning: string | null = null;

  isReferralReadonly: boolean = false;

  onPaymentSuccess(paymentStatus: any) {
    console.log('payyyyy', paymentStatus)
    this.payment_options = 'Gpay';
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
    console.log('transaction_id', this.transaction_id)
    setTimeout(() => {
      this.transactionSuccessGpay = false;
      this.showGpayModal = false;
    }, 1000);
  }

  constructor(private fb: FormBuilder,
    private paymentService: PaymentService,
    private referralService: ReferralService,
    private renderer: Renderer2,
    private http: HttpClient,
    private web: WebService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: ListingDataService) {

    this.existData = this.dataService.getData();
    console.log('this.existData', this.existData);
    this.data = this.existData.source._value;
    console.log("this.data!!", this.data);
    if (!this.data) {
      console.error('No data found!');
    }

    this.registerForm = this.fb.group({
      businessName: [null, Validators.required],
      listingId: [null],
      files: [null],
      phone: [null, Validators.required],
      screenshot: [null],
      email: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/), Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmpassword: [null, Validators.required],
      country: [null, Validators.required],
      region: [null, Validators.required],
      state: [null, Validators.required],
      city: [null, Validators.required],
      zipCode: [null, Validators.required],
      transaction_id: [null],
      paymentOptions: [null],
      referral_code: [''],
    },
      {
        validator: this.passwordMatchValidator
      });
    this.bindFormData();
    this.loadReferralCodeFromUrl();
  }


  bindFormData() {
    if (this.data) {
      const sanitizedData = {
        businessName: this.data.company_name || '',
        description: this.data.sic_description || '',
        region: this.data.address || '',
        city: this.data.city || '',
        state: this.data.state || '',
        zipCode: this.data.zip || '',
        country: this.data.country || '',
        phone: this.data.phone || '',
        fax: this.data.fax_number || '',
        website: this.data.website || '',
        industry: this.data.industry || '',
        listingId: this.data.id || '',
      };
      this.registerForm.patchValue(sanitizedData);

      // If country is set, fetch states to populate the dropdown
      if (this.data.country) {
        const selectedCountry = this.countries.find(country => country.iso2 === this.data.country);
        if (selectedCountry) {
          this.fetchStates(selectedCountry.name);
          // Set country to iso3
          this.registerForm.patchValue({ country: selectedCountry.iso3 });
        }
      }
    }
  }

  /**
   * Load referral code from URL parameters and auto-fill form
   */
  loadReferralCodeFromUrl(): void {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        this.referralCode = ref;
        this.registerForm.get('referral_code')?.setValue(ref);
        // Trigger validation immediately after setting the value from URL
this.onReferralCodeChange(ref);
        this.isReferralReadonly = true;
      }
    }
  }

  /**
   * Validate referral code on input change (optional but good UX)
   */
  onReferralCodeChange(code: string): void {
    this.referralCode = code;
    if (code && code.length > 0) {
      this.referralCodeValidationStatus = 'checking';
      this.referralService.validateReferralCode(code).subscribe(
        (response) => {
          if (response.valid || response.exists) {
            this.referralCodeValidationStatus = 'valid';
          } else {
            this.referralCodeValidationStatus = 'invalid';
          }
        },
        (error) => {
          console.warn('Could not validate referral code:', error);
          this.referralCodeValidationStatus = null;
        }
      );
    } else {
      this.referralCodeValidationStatus = null;
    }
  }


  ngOnInit(): void {
    // this.route.queryParams.subscribe(params => {
    //   const listingData = params['listingData'];
    //   console.log('listingData', listingData);
    //   if (listingData) {
    //     this.data = JSON.parse(listingData);
    //     console.log('this.data', this.data);
    //   }
    // })
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
      this.payment_options = 'Stripe';
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
        this.transactionSuccessStripe = true;
        this.showStripeModal = false;

      }, 3000);
      console.log("this.showStripeModal", this.showStripeModal);

    });
  }


  passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmpassword');
    // console.log(this.registerForm.invalid || !this.registerForm.get('transaction_id')?.value || this.registerForm.errors?.['mismatch'] || !this.registerForm.get('screenshot')?.value)
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      console.log('Passwords do not match');
      return { mismatch: true };
    } else {
      return null;
    }
  }

  countryCodeSelected() {
    this.http.get<{ data: { iso2: string; iso3: string; name: string; states: any[] }[], error: boolean, msg: string }>(`${this.apiUrl}getCountriesStates`).subscribe(
      (response) => {
        console.log("countries response", response);
        if (!response.error && response.data) {
          this.countries = response.data.map(country => ({ name: country.name, iso2: country.iso2, iso3: country.iso3 }));

          // After countries are loaded, check if we need to fetch states for pre-filled data
          if (this.data && this.data.country) {
            const selectedCountry = this.countries.find(country => country.iso2 === this.data.country);
            if (selectedCountry) {
              this.fetchStates(selectedCountry.name);
            }
          }
        } else {
          console.warn('No countries found:', response.msg);
          this.countries = [];
        }
      },
      (error) => {
        console.error('Error fetching countries:', error);
        this.countries = [];
      }
    );
  }

  onCountryChange(event: any): void {
    const selectedCountryCode = event.target.value;
    console.log("selectedCountryCode", selectedCountryCode);
    this.registerForm.get('country')?.setValue(selectedCountryCode);
    if (selectedCountryCode) {
      const selectedCountry = this.countries.find(country => country.iso3 === selectedCountryCode);
      const countryName = selectedCountry ? selectedCountry.name : selectedCountryCode;
      this.fetchStates(countryName);
    } else {
      this.states = [];
      this.registerForm.get('state')?.setValue(null);
    }
  }

fetchStates(countryCode: string): void {
  const url = `${this.apiUrl}getCountriesStates/${encodeURIComponent(countryCode)}`;

  this.http.get<{
    data: {
      iso2: string;
      iso3: string;
      name: string;
      states: { name: string; state_code: string }[];
    }[];
    error: boolean;
    msg: string;
  }>(url).subscribe(
    (response) => {
      console.log("states response", response);

      if (!response.error && response.data?.length) {
        // ✅ extract states properly
        this.states = response.data[0].states || [];

        // ✅ set prefilled state
        if (this.data?.state) {
          const matchingState = this.states.find(
            s => s.state_code === this.data.state
          );

          if (matchingState) {
            this.registerForm.get('state')?.setValue(matchingState.state_code);
          }
        }
      } else {
        console.warn('No states found:', response.msg);
        this.states = [];
      }
    },
    (error) => {
      console.error('Error fetching states:', error);
      this.states = [];
    }
  );
}



  loadPayPalScript(): void {
    const clientId = environment.paypalClientId;
    const scriptUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;

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
              value: '1.30'
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('Transaction completed by ' + details.payer.name.given_name);
          this.payment_options = 'Paypal';
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
      this.newfilename = newFileName;
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
    console.log("this.registerForm.value1", this.registerForm.value);
    if (this.selectedPayment == null) {
      this.showValidationPayment = true;
      this.showToastNotification();
    }
    else if (this.selectedPayment != null) {
      console.log("this.registerForm.value2", this.registerForm.value);
      if (this.registerForm.valid) {
        console.log("this.registerForm.value3", this.registerForm.value);
        this.registerForm.get('screenshot')?.setValue(`${this.apiUrl}uploads/screenshot/${this.newfilename}`);
        console.log("this.registerForm.valu4", this.registerForm.value);
        this.http.post(`${this.apiUrl}save-registration`, this.registerForm.value)
          .subscribe(
            response => {
              this.showsuccessmessage = true;
              this.details = response
              // Check for referral warning in the response
              if (this.details.referral_warning) {
                this.referralWarning = this.details.referral_warning;
                console.warn('Referral Warning:', this.referralWarning);
              }
              if (this.details.status) {
                this.showsuccessmessage = true;
                this.isSubmitted = false;
                this.responseregister = response;
                this.showsuccessmessage = true;
                const payload = { data: this.responseregister.data };
                this.http.post(`${this.apiUrl}sendmailregisterAdmin`, payload, {
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
              this.referralWarning = null; // Clear warning on successful registration
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
    if (this.selectedPayment === 'qrcode') {
      this.openQrCodeModal();
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
  openStripeModal() {
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

  openQrCodeModal(){
    this.showQrCodeModal = true;
  }

  closeQrCodeModal() {
    this.showQrCodeModal = false;
  }
  

  isAmenitySelected(amenity: string): boolean {
    const amenitiesArray = this.registerForm.get('amenities') as FormArray;
    console.log("1.amenitiesArray", amenitiesArray)
    return amenitiesArray.value.includes(amenity);
  }

  onAmenityClick(title: string, event: Event, category: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const amenitiesArray = this.registerForm.get('amenities') as FormArray;
    console.log("2.amenitiesArray", amenitiesArray)

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
    console.log('step', this.registerForm);
    switch (step) {
      case 1:
        return !!this.registerForm.get('businessName')?.valid &&
          !!this.registerForm.get('country')?.valid &&
          !!this.registerForm.get('phone')?.valid &&
          !!this.registerForm.get('region')?.valid &&
          !!this.registerForm.get('state')?.valid &&
          !!this.registerForm.get('city')?.valid &&
          !!this.registerForm.get('zipCode')?.valid &&
          (!!this.registerForm.get('screenshot')?.value || !!this.registerForm.get('transaction_id')?.value);
      case 2:
        return true;
      default:
        return true;
    }
  }

 nextStep() {
    if (this.isStepValid(this.step) && this.step < 2) {
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

  loadScript() {
    console.log("Loading script...");
    const script = this.renderer.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js'; //https://sandbox.web.squarecdn.com/v1/square.js
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

      const applicationId = "sq0idp-ZRGBiBkinixwOBZmNxyjCg"; //sandbox-sq0idb-njBgtuXFMDflZxobPrR7Jg
      const locationId = "L42A595RXD9V9"; //L8KFYVYEZHHHX
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
            console.log("getresponse for register", this.response);


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
            console.log("this.response.paymentId.payment.total_money.amount", this.response.paymentId.payment.total_money.amount);
            this.amount = this.response.paymentId.payment.total_money.amount;
            this.currency = this.response.paymentId.payment.total_money.currency;
            this.transaction_id = this.response.paymentId.payment.order_id;
            this.transaction_date = this.response.paymentId.payment.created_at;
            this.payment_options = 'Square';
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

  onFileChangeqrcode(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log("Selected file:", file);
  
      // Generate a random number for the filename
      const randomNumber = Math.floor(Math.random() * 1000000);
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const fileExtension = file.name.split('.').pop(); // Get the file extension
  
      // New filename format: Global_originalname_randomnumber.extension
      const newFileName = `Global_${fileNameWithoutExtension}_${randomNumber}.${fileExtension}`;
      this.newfilename = newFileName;
  
      console.log('newFileName:', newFileName);
  
      // Append the file (screenshot) to FormData with the new filename
      const formData = new FormData();
      formData.append('screenshot', file, newFileName); // Use new filename

      const reader = new FileReader();
      reader.onload = () => {
        this.screenshotPreview = reader.result;
        this.registerForm.patchValue({ screenshot: file });
      };
      reader.readAsDataURL(file);
  
      // Send the file to the backend
  
      console.log('formData:', formData);
      this.http.post(`${this.apiUrl}save-screenshot`, formData)
        .subscribe(
          response => {
            console.log('Uploaded image:', response);
          },
          error => {
            console.error('Error occurred while saving data', error);
          }
        );
    }
  }
  
  

  removeScreenshot() {
    console.log('removeScreenshot');
    this.screenshotPreview = null;
    // this.isScreenshotUploaded = false;
    this.registerForm.patchValue({ screenshot: null });
    console.log('this.registerForm remove', this.registerForm);
  }

  showToastNotification() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000); // Hide after 3 seconds
  }
}