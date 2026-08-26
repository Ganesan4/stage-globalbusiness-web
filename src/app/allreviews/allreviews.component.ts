import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { WebService } from '../services/web.service';

@Component({
  selector: 'app-allreviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './allreviews.component.html',
  styleUrl: './allreviews.component.scss'
})
export class AllreviewsComponent implements OnInit {
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  status: any;
  ratings: number;
  comments: any;
  email: any;
  name: any;

  constructor(private web: WebService) { }

  showReviewForm = false;
  review_data = [];
  
  
  ngOnInit(): void {
    this.getreviewslist();
  }

  getreviewslist(){
    const user = localStorage.getItem('userId');
    this.web.getData('getReviews/'+user+'').then((response: any) => {
      console.log("response12",response);
      this.review_data = response.data;  
    })
  }

  changeActive(review : any){ 
    const confirmAction = window.confirm(
      `Are you sure you want to ${review.status === 0 ? 'activate' : 'deactivate'} this review?`
  );
  if (confirmAction) {
    let arr = { id: review.id, status: review.status == 0 ? 1 : 0 };
    this.web.postData('changeActive', arr).then((response: any) => {
      if (response.status) {
        console.log("Response:", response);
        this.showNotification('updated successfully','success');
        this.getreviewslist(); 
      }
      else {
        this.showNotification('Failed to update my profile. Please try again.', 'error');
      }
    });
} else {
    console.log("Action canceled by the user.");
}
}

  showReview(review : any): void {
    this.showReviewForm = true;
    this.name = review.name;
    this.email = review.email;
    this.comments = review.comments;
    // this.ratings = Math.max(1, Math.min(5, parseInt(review.ratings, 10)));
    this.ratings = review.rating;
    console.log("this.ratings",this.ratings);
    this.status = review.status == 0 ? 'InActive' : 'Active';

  }

  closeReviewForm(){
    this.showReviewForm = false;
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
