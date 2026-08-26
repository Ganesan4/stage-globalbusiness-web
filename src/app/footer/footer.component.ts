import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WebService } from '../services/web.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private web: WebService
  ) { }

  newsletterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  sendEmailNewsletter() {
    if (this.newsletterForm.invalid) {
      if (this.newsletterForm.get('email')?.hasError('required')) {
        this.toastr.error('Email is required');
      }
      else if (this.newsletterForm.get('email')?.hasError('email')) {
        this.toastr.error('Please enter a valid email address');
      }
      return;
    }

    const email = this.newsletterForm.value.email;

    this.web.postData('sendemail_newsletter', { email }).then((response: any) => {
      if (response.status === true) {
        this.toastr.success('Subscribed successfully and email sent!');
        this.newsletterForm.reset();
      } else {
        this.toastr.error(response.message || 'Something went wrong');
      }
    });
  }
}
