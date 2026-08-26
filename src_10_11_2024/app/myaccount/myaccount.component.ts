import { CommonModule } from '@angular/common';
import { Component, Injectable, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PaymentService } from '../services/payment.service';
import { HttpClient } from '@angular/common/http';
import { StripeComponent } from "../stripe_payment/stripe/stripe.component";
import { WebService } from '../services/web.service';
import { environment } from '../../environments/environment';

Injectable({
  providedIn: 'root'
})
declare var Square: any;
declare var paypal: any;

@Component({
  selector: 'app-myaccount',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, StripeComponent],
  templateUrl: './myaccount.component.html',
  styleUrl: './myaccount.component.scss'
})
export class MyaccountComponent implements OnInit {
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  apiUrl = environment.base_url;
  registerForm: FormGroup;
  step = 1;
  selectedPayment: string | null = null;
  showSquareModal: boolean = false;
  showModal = false;
  selectedAmenityTitle: string = '';
  description: string = '';
  isFree: boolean = false;
  cost: number | null = null;
  showOkButton: boolean = false;
  showPayPalModal: boolean = false;
  showStripeModal: boolean = false;
  transactionSuccessStripe :boolean = false;
  data: any;
  payments: any;
  response:any;
  card: any;
  cardButton: HTMLButtonElement | null = null;
  statusContainer: HTMLElement | null = null;
  existingEmails: string[] = [];
  stepLabels = ['Basic Info', 'Products & Services', 'Support', 'Final Details'];
  // newfilename: string;
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
  user_id: string;
  myprofiledata: any;
  // logoUrl: string;
  showsuccess: string;

  logoUrl: string | ArrayBuffer | null = null;
  selectedFileName: string = 'No file chosen';
  newfilename: string | null = null;

  constructor(private fb: FormBuilder, private paymentService: PaymentService,private renderer: Renderer2,private http: HttpClient, private web: WebService) {
   
    this.registerForm = this.fb.group({
      business_name: ['', Validators.required],
      logo: [null],
      // files: [null], 
      tagline: [''],
      phone: ['', Validators.required],
      email: [''],
      country: ['', Validators.required],
      region: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      zip_code: ['', Validators.required],
    },
   );
  }


  ngOnInit(): void {
    this.user_id = localStorage.getItem('userId');
    console.log("User id:", this.user_id);
    if(this.user_id){
      this.myprofile();
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Generate a random filename
      const randomNumber = Math.floor(Math.random() * 1000000);
      const fileExtension = file.name.split('.').pop();
      const newFileName = `Globalbusiness_${randomNumber}.${fileExtension}`;
      this.newfilename = newFileName;

      // Update the file name for display
      this.selectedFileName = file.name;

      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoUrl = e.target?.result; // Set the logo preview
      };
      reader.readAsDataURL(file);

      // Upload the file
      const formData = new FormData();
      formData.append('logo', file, newFileName);
      
      this.http.post(`${this.apiUrl}save-logo`, formData).subscribe(
        (response: any) => {
          console.log('Uploaded image:', response);

          // After successful upload, update the file name based on API response if needed
          if (response && response.logoUrl) {
            this.logoUrl = response.logoUrl; // Update image preview URL if API provides it
            this.selectedFileName = newFileName; // Update displayed filename
          }
        },
        error => {
          console.error('Error occurred while saving data', error);
        }
      );
    }
  }
  
  async onSubmit() {   
    if (this.registerForm.valid) {
      console.log("this.newfilename",this.newfilename);
      if(this.selectedFileName != 'No file chosen'){
        if(this.newfilename){
          
          this.registerForm.get('logo')?.setValue(`${this.apiUrl}uploads/register_logo/${this.newfilename}`);
        } else {
          this.registerForm.get('logo')?.setValue(this.selectedFileName);
        }
      }
      const response = await this.web.postData('edituserdata', {form: this.registerForm.value, id: this.user_id});

        if(response.status) {
          console.log('Registration successful');
          this.showNotification('updated successfully!', 'success');
          this.myprofile();
        }
        else {
          this.showNotification('Failed to update my profile. Please try again.', 'error');
        } 
    
    } else {
      console.log('Form is invalid');
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = null;
      this.notificationType = null;
    }, 3000); 
  }

  async myprofile(){
    try{
      const res = await this.web.postData('myprofile',{"userid":this.user_id})
      console.log("responsemy:",res)
      if(res.status){
        this.myprofiledata = JSON.parse(res.message)
        console.log("this.myprofiledata",this.myprofiledata);

        this.logoUrl = this.myprofiledata.logo.endsWith('/undefined') ? 'assets/img/dummy.jpg' : this.myprofiledata.logo;
        this.selectedFileName = this.myprofiledata.logo.endsWith('/undefined') || this.myprofiledata.logo.endsWith('/null') ? 'No file chosen' : this.myprofiledata.logo;

        this.registerForm.patchValue({
          logo: this.logoUrl,
          business_name: this.myprofiledata.business_name,
          tagline: this.myprofiledata.tagline == "NULL" ? "" : this.myprofiledata.tagline,
          country: this.myprofiledata.country,
          region: this.myprofiledata.region,
          state: this.myprofiledata.state,
          city: this.myprofiledata.city,
          zip_code: this.myprofiledata.zip_code,
          phone : this.myprofiledata.phone,
          email: this.myprofiledata.email,
        });
        console.log("this.registerForm",this.logoUrl)
      }
    } catch(err){
      console.log(err)
    }
  
  }

}