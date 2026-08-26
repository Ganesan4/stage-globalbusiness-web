import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebService } from '../services/web.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})
export class FeedbackComponent implements OnInit {
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  showEditFeedbackForm = false;
  showFeedbackForm = false;
  currentFeedbackId: number | null = null;
  showReplymodal = false;
  replyForm : FormGroup

  feedback_data = [];
  name: any;
  email: any;
  address: any;
  phone: any;
  comments: any;
  // reply_msg: any;
  reply_by: any;
  user_id: any;

  constructor(private fb: FormBuilder,private web: WebService,) {
    this.replyForm = this.fb.group({
      comments: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.user_id = localStorage.getItem('userId');
    console.log("User id in feedback:", this.user_id);
    if(this.user_id){
      this.getfeedback();
    }
  }

  getfeedback(){
    this.web.postData('getFeedback',{"userid":this.user_id}).then((response: any) => {
      console.log("response12",response);
      this.feedback_data = response.data;
    })
  }

  deleteFeedback(bannerId: number): void {
    console.log("BannerId:", bannerId);
    // if (!confirm('Are you sure you want to delete this banner?')) return;
    // this.http.delete(`${this.apiUrl}/banner/${bannerId}`)
    //   .pipe(
    //     catchError(error => {
    //       console.error('Error deleting banner:', error);
    //       this.showNotification('Failed to delete banner. Please try again.', 'error');
    //       return throwError(() => error);
    //     })
    //   )
    //   .subscribe(() => {
    //     this.showNotification('Banner deleted successfully!', 'success');
    //     this.fetchBanners();
    //   });
  }

  showFeedback(feedback: any): void {
    console.log("Feedback:", feedback);
    this.name = feedback.name;
    this.email = feedback.email;
    this.address = feedback.address;
    this.phone = feedback.phone;
    this.comments = feedback.comments;
    this.reply_by = feedback.reply_by;
    this.showFeedbackForm = true;
  }

  submitReplyForm(id,email,msg,name): void {
    console.log("id",id)
    console.log("hsadfsabdfiub",this.replyForm)
    if (this.replyForm.invalid) {
      this.replyForm.markAllAsTouched(); 
      return;
    }

    if (this.currentFeedbackId === null) {
      console.error('No banner ID set for editing');
      return;
    }

    const updatedBanner = {
      id: id,
      // user_id: localStorage.getItem('userId'),
      comments: this.replyForm.value.comments,
      email: email,
      msg: msg,
      name: name
      
    };
    this.web.postData('replyFeedback', updatedBanner).then(res => {
      console.log('reply database',res);
      if (res.status) {
        this.showReplymodal = false;
        this.showNotification('Feedback updated successfully and Send Mail.', 'success');
        this.getfeedback();
      }
      else {
        this.showNotification('Failed to update banner. Please try again.', 'error');
      }
    })
  }

  closeEditForm(): void {
    this.showFeedbackForm = false;
    this.showReplymodal = false;
    this.resetEditForm();
  }

  private resetEditForm(): void {
    this.replyForm.reset();
  }

  replayFeedback(feedback: any): void {
    console.log("Replay Feedback", feedback, feedback.id);
    this.showReplymodal = true;
    this.currentFeedbackId = feedback.id;
    this.email = feedback.email;
    this.comments = feedback.comments;
    this.name = feedback.name;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = null;
      this.notificationType = null;
    }, 3000); 
  }

}
