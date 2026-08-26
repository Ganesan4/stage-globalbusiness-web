import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NgOtpInputComponent } from 'ng-otp-input';
import  firebase  from 'firebase/compat/app';
import "firebase/compat/auth";
import "firebase/firestore"
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAnalytics } from "firebase/analytics";
import { ListingDataService } from '../services/listingData.service';


var config = {
  apiKey: "AIzaSyA3SVLjqXfh96pObbhCOtRd7erAGIG6e9I",
  authDomain: "global-business-pages.firebaseapp.com",
  projectId: "global-business-pages",
  storageBucket: "global-business-pages.firebasestorage.app",
  messagingSenderId: "384318191197",
  appId: "1:384318191197:web:a82a7e5402dd334a8dbfb4",
  measurementId: "G-X32PGW1XKM"
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, 
    ReactiveFormsModule,
    NgOtpInputComponent,
    RouterModule
    
  ]
})
export class LoginComponent implements OnInit {

  configuration = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      width: '3rem', 
      height: '3rem', 
      margin: '0.3rem', 
      border: '1px solid #D1D5DB', 
      borderRadius: '0.375rem', 
      fontSize: '1.25rem', 
      textAlign: 'center',
      backgroundColor: '#FFFFFF', 
    },
  };
  
  selectedTab = 'emailUser';
  apiUrl = environment.base_url;
  emailUserForm!: FormGroup;
  phoneUserForm!: FormGroup;
  response: any;
  message: string = '';
  messageType: 'success' | 'error' = 'error';
  showMessage = false;
  errorMessage: string = '';
  reCaptchaVerifier: any;
  phoneNumber: any;
  otpEnabled: boolean = false;
  verificationId: string;
  otp: any;
  data: any;
  datas: any;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private authService: AuthService, private toastr: ToastrService,
    private DataService : ListingDataService
  ) {
    console.log('LoginComponent initialized');
  }

  ngOnInit() {
    firebase.initializeApp(config)
    this.emailUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.phoneUserForm = this.fb.group({
      companyName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    })
    // this.getregisterdetails();  
  }
  // displayMessage(msg: string, type: 'success' | 'error') {
  //   this.message = msg;
  //   this.messageType = type;
  //   this.showMessage = true;
  //   setTimeout(() => {
  //     this.showMessage = false;
  //   }, 2000);
  // }


  async onEmailSubmit() {
    if (this.emailUserForm.invalid) {
      if (this.emailUserForm.get('email')?.hasError('required') || this.emailUserForm.get('email')?.hasError('email')) {
        this.toastr.error('Email is required and must be valid.', 'Error');
      }

      if (this.emailUserForm.get('password')?.hasError('required')) {
        this.toastr.error('Password is required.', 'Error');
      }

      this.toastr.error('Please fill in all fields correctly.', 'Error');
      return;
    }

    const { email, password } = this.emailUserForm.value;
    console.log(`email: ${email}, password: ${password}`);

    this.http.post(`${this.apiUrl}login`, { email, password })
      .subscribe(
        (res: any) => {
          if (res.status) {
            this.toastr.success(res.message, 'success');
            this.authService.setLoggedIn(true);
            
            if (res.user_type === 'affiliate') {
              localStorage.setItem('affiliateUser', 'true');
              localStorage.setItem('affiliateId', res.user.id);
              localStorage.setItem('affiliateName', res.user.name);
              localStorage.setItem('affiliateEmail', res.user.email);
              localStorage.setItem('affiliateReferralCode', res.user.referral_code);
              
              setTimeout(() => {
                this.router.navigate(['/account/affiliate-dashboard']);
              }, 1000);
            } else {
              console.log("User data:", res.user);
              localStorage.setItem('userId', res.user.id);
              localStorage.setItem('isLoggedIn', 'true');
              
              if (res.user.role) {
                localStorage.setItem('userRole', res.user.role);
              }

              setTimeout(() => {
                this.router.navigate(['/account']);
              }, 1000);
            }
          } else {
            this.toastr.error(res.message, 'error');

            if (res.message.includes("register")) {
              setTimeout(() => {
                this.router.navigate(['/register']);
              }, 2000);
            }
          }
        },
        (err) => {
          console.error('Login error:', err);

          if (err.status === 400) {
            this.toastr.error('Email not registered. Please sign up.', 'error');
          } else if (err.status === 401) {
            this.toastr.error('Incorrect password. Please try again.', 'error');
          } else if (err.status === 403) {
            this.toastr.error('Your account is not activated by the admin.', 'error');
          } else if (err.status === 406) {
            this.toastr.error('Kindly verify your account by your email.', 'error');
          } else if (err.status === 410) {
            this.toastr.error('Your account has been deactivated or deleted.', 'error');
          } else {
            this.toastr.error('Unexpected error during login, please try again later.', 'error');
          }
        }
      );
  }
  switchTab(tab: string) {
    this.selectedTab = tab;
  }

  onPhoneUserLogin() {
    if (this.phoneUserForm.invalid) {
      if(this.phoneUserForm.get('companyName')?.hasError('required')) {
        this.toastr.error('Please enter a company name.', 'Error');
        return;
      }
      if(this.phoneUserForm.get('phoneNumber')?.hasError('required') || this.phoneUserForm.get('phoneNumber')?.hasError('pattern')) {
        this.toastr.error('Please enter a valid phone number.', 'Error');
        return;
      }
      this.toastr.error('Please fill in all fields correctly.', 'Error');
      return;
    }

    const { companyName, phoneNumber } = this.phoneUserForm.value;
    this.http.post(`${environment.base_url}phone-verify`, { companyName, phoneNumber })
      .subscribe(
        (res: any) => {
          if (res.status) {
            console.log('Response:', res); 
            this.DataService.setData(res.data);
            // this.datas = res.data;
            this.reCaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { size: 'invisible' });
            firebase.auth().signInWithPhoneNumber(`+1${phoneNumber}`, this.reCaptchaVerifier)
              .then((result) => {
                console.log('OTP sent successfully:', result);
                this.toastr.success('OTP sent successfully', 'Success');
                this.verificationId = result.verificationId;
                this.otpEnabled = true; 
              })
              .catch((error) => {
                console.error('Error during phone sign-in:', error);
                this.toastr.error('Failed to send OTP. Please try again.', 'Error');
              });
          } else {
            this.toastr.error('Something went wrong', 'Error');
          }
        },
        (err) => {
          console.error('Phone verification error:', err);
          this.toastr.error('Failed to verify phone number. Please try again.', 'Error');
        }
      );
  }

  onOtpChange(otpCode: string) {
    this.otp = otpCode; // Capture OTP input
  }

  handleClick() {
    if (!this.verificationId || !this.otp) {
      this.toastr.error('Please enter a valid OTP.', 'Error');
      return;
    }

    const credentials = firebase.auth.PhoneAuthProvider.credential(this.verificationId, this.otp);
    firebase.auth().signInWithCredential(credentials)
      .then((result) => {
        console.log('Login successful:', result);
        this.toastr.success('OTP verification successful!', 'Success');
        this.router.navigate(['/register']);
      })
      .catch((error) => {
        console.error('Error signing in with credential:', error);
        this.toastr.error('Failed to sign in with OTP. Please try again.', 'Error');
      });
  }
}
  
  
      