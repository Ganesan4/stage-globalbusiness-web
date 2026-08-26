import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebService } from '../services/web.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  passwordForm!: FormGroup;
  loading = false;
  submitted = false;
  message: string = '';
  status: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private web: WebService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.formBuilder.group({
      currentpassword: ['', Validators.required],
      newpassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmpassword: ['', Validators.required]
    }, { validators: this.mustMatch('newpassword', 'confirmpassword') });
  }

  // Access form controls using index notation
  get f() {
    return this.passwordForm.controls;
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
      return null;
    };
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.passwordForm.invalid) {
      return;
    }

    if (this.passwordForm.value.currentpassword === this.passwordForm.value.newpassword) {
      // this.status = false;
      // this.message = 'New password should not be same as current password';
      this.showNotification('New password should not be same as current password', 'error');
      return;
    }


    this.loading = true;
    const userId = localStorage.getItem('userId');
    console.log('user iddd',userId);
    console.log('formm',this.passwordForm.value);
    this.web.postData('user_changepassword', { arr: this.passwordForm.value, user_id: userId }).then(
      (res) => {
        if (res.status) {

          // console.log('res',res);
          this.loading = false;
          // this.status = true;
          // this.message = 'Password updated successfully!';
          this.showNotification('Password updated successfully!', 'success');
          this.passwordForm.reset();
          this.submitted = false;
        }
        else {
          this.loading = false;
          // this.status = false;
          // this.message = res.message;
          this.showNotification('Incorrect password.', 'error');
        }
      },
      (error) => {
        console.log('errorrrrr',error);
        this.loading = false;
        // this.status = false;
        // this.message = 'The current password is incorrect!';
        this.showNotification('Failed to update password. Please try again.', 'error');
      }
    ).catch(() => {
      this.loading = false;
      // this.status = false;
      // this.message = 'The current password is incorrect!';
      this.showNotification('Failed to update password. Please try again.', 'error');
    });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = null;
      this.notificationType = null;
    }, 3000); 
  }

  onReset(): void {
    this.submitted = false;
    this.passwordForm.reset();
  }

  clearMessage(): void {
    this.message = '';
  }
}
