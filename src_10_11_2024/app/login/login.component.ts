import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-login',
  standalone: true,  
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], 
  imports: [CommonModule, ReactiveFormsModule] 
})
export class LoginComponent implements OnInit {
  apiUrl = environment.base_url;
  loginForm!: FormGroup;
  response: any;
  message: string = '';
  messageType: 'success' | 'error' = 'error'; 
  showMessage = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router,private http: HttpClient,private authService: AuthService) { 
    console.log('LoginComponent initialized');
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    
    // this.getregisterdetails();  
  }
  displayMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 2000);
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
        this.displayMessage('Please fill in all fields correctly.', 'error');
        return;
    }

    const { email, password } = this.loginForm.value;
    console.log(`email: ${email}, password: ${password}`);

    this.http.post(`${this.apiUrl}login`, { email, password })
        .subscribe(
            (res: any) => {
                if (res.status) {
                    this.displayMessage(res.message, 'success');
                    this.authService.setLoggedIn(true);
                    // localStorage.setItem('isLoggedIn', "true");
                    this.authService.setLoggedIn(true);
                    console.log("User data:", res.user);
                    localStorage.setItem('userId', res.user.id);

                    if (res.user.role) {
                        localStorage.setItem('userRole', res.user.role); 
                    }

                    setTimeout(() => {
                        // 
                        this.router.navigate(['/account']);
                    }, 1000);
                } else {
                    this.displayMessage(res.message, 'error');

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
                    this.displayMessage('Email not registered. Please sign up.', 'error');
                } else if (err.status === 401) {
                    this.displayMessage('Incorrect password. Please try again.', 'error');
                } else if (err.status === 403) {
                    this.displayMessage('Your account is not activated by the admin.', 'error');
                } else if (err.status === 406) {
                    this.displayMessage('Kindly verify your account by your email.', 'error');
                } else if (err.status === 410) {
                    this.displayMessage('Your account has been deactivated or deleted.', 'error');
                } else {
                    this.displayMessage('Unexpected error during login, please try again later.', 'error');
                }
            }
        );
}
}
