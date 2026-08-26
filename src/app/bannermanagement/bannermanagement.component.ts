import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-bannermanagement',
  templateUrl: './bannermanagement.component.html',
  standalone: true,  
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  styleUrls: ['./bannermanagement.component.scss']
})
export class BannermanagementComponent implements OnInit {
  showBannerForm = false;
  showEditBannerForm = false;
  imagePreview: string | null = null;
  editImagePreview: string | null = null;
  bannerForm: FormGroup;
  editBannerForm: FormGroup;
  currentEditBannerId: number | null = null; 
  banners: any[] = [];
  isLoading = false;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  apiUrl = environment.base_url;
  
  // private apiUrl = 'http://localhost:5000';


  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.bannerForm = this.fb.group({
      // comments: ['', [Validators.required, Validators.minLength(3)]],
      altText: ['', [Validators.required, Validators.minLength(3)]],
      image: [null, Validators.required] 
    });

    this.editBannerForm = this.fb.group({
      // comments: ['', [Validators.required, Validators.minLength(3)]],
      altText: ['', [Validators.required, Validators.minLength(3)]],
      // image: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchBanners();
  }

  fetchBanners(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      alert('User not logged in. Please log in to view your banners.');
      return;
    }
  
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}getBanners/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching banners:', error);
          // alert('Failed to fetch banners. Please try again later.');
          return throwError(() => error);
        })
      )
      .subscribe(data => {
        console.log("Dataaaa:", data);
        this.banners = data.map(banner => {
          const rawImage = banner[2]; 
          const cleanedImage = rawImage.replace(/^(data:image\/\w+;base64,)+/, 'data:image/png;base64,'); // Keep only one prefix
          return {
            id: banner[0], 
            image: cleanedImage,
            altText: banner[3], 
          };
        });
        this.isLoading = false;
      });
  }

  // constructor(private http: HttpClient, private fb: FormBuilder) {
  //   this.bannerForm = this.fb.group({
  //     comments: ['', [Validators.required, Validators.minLength(3)]],
  //     altText: ['', [Validators.required, Validators.minLength(3)]],
  //     image: [null, Validators.required] 
  //   });

  //   this.editBannerForm = this.fb.group({
  //     comments: ['', [Validators.required, Validators.minLength(3)]],
  //     altText: ['', [Validators.required, Validators.minLength(3)]],
  //     image: [null, Validators.required]
  //   });
  // }

  // ngOnInit(): void {
  //   this.fetchBanners();
  // }

  // fetchBanners(): void {
  //   const userId = localStorage.getItem('userId');
  //   if (!userId) {
  //     console.error('User ID not found in localStorage');
  //     alert('User not logged in. Please log in to view your banners.');
  //     return;
  //   }
  
  //   this.isLoading = true;
  //   this.http.get<any[]>(`${this.apiUrl}/getBanners/${userId}`)
  //     .pipe(
  //       catchError(error => {
  //         console.error('Error fetching banners:', error);
  //         alert('Failed to fetch banners. Please try again later.');
  //         return throwError(() => error);
  //       })
  //     )
  //     .subscribe(data => {
  //       console.log("Dataaaa:", data);
  //       this.banners = data.map(banner => {
  //         const rawImage = banner[2]; 
  //         const cleanedImage = rawImage.replace(/^(data:image\/\w+;base64,)+/, 'data:image/png;base64,'); // Keep only one prefix
  //         return {
  //           id: banner[0], 
  //           image: cleanedImage,
  //           altText: banner[3], 
  //         };
  //       });
  //       this.isLoading = false;
  //     });
  // }

  showForm(): void {
    this.showBannerForm = true;
  }

  closeForm(): void {
    this.showBannerForm = false;
    this.resetForm();
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
  
    if (file) {
     
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        this.imagePreview = null;
        this.bannerForm.get('image')?.setErrors({ invalidFile: true });
        return;
      }
  
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (e: ProgressEvent<FileReader>) => {
        img.src = e.target?.result as string;
  
        img.onload = () => {
         
          if (img.width === 1500 && img.height === 550) {
            this.bannerForm.get('image')?.setErrors(null); 
            this.imagePreview = img.src; 
            this.bannerForm.patchValue({ image: this.imagePreview }); 
          } else {
            this.imagePreview = null; 
            this.bannerForm.get('image')?.setErrors({ invalidSize: true }); 
          }
          
        };
      };
  
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
      this.bannerForm.get('image')?.setErrors({ required: true });
    }
  }
  
  

  submitForm(): void {
    if (this.bannerForm.invalid || !this.imagePreview) {
      this.bannerForm.markAllAsTouched(); 
      return;
    }

    const userId = localStorage.getItem('userId');
    const newBanner = {
      user_id: userId,
      image: this.imagePreview, 
      alttext: this.bannerForm.value.altText,
      comments: this.bannerForm.value.comments,
      status: 'Active'
    };

    console.log("Dataaaa:", newBanner);

    this.http.post(`${this.apiUrl}insertBanner`, newBanner)
      .pipe(
        catchError(error => {
          console.error('Error adding banner:', error);
          this.showNotification('Failed to add banner. Please try again.', 'error');
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.showNotification('Banner added successfully!', 'success');
        this.fetchBanners();
        this.closeForm();
      });
  }

  showEditForm(banner: any): void {
    this.currentEditBannerId = banner.id;
    this.editBannerForm.patchValue({
      comments: banner.comments || '',
      altText: banner.altText || '',
      image: null 
    });
    this.editImagePreview = banner.image;
    this.showEditBannerForm = true;
  }

  closeEditForm(): void {
    this.showEditBannerForm = false;
    this.resetEditForm();
  }

  onEditImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.editImagePreview = reader.result as string;
        this.editBannerForm.patchValue({ image: this.editImagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  submitEditForm(): void {
    if (this.editBannerForm.invalid || !this.editImagePreview) {
      this.editBannerForm.markAllAsTouched();
      return;
    }

    if (this.currentEditBannerId === null) {
      console.error('No banner ID set for editing');
      return;
    }

    const updatedBanner = {
      user_id: localStorage.getItem('userId'),
      image: this.editImagePreview,
      altText: this.editBannerForm.value.altText,
      comments: this.editBannerForm.value.comments,
      status: 'Active'
    };

    this.http.put(`${this.apiUrl}updateBanner/${this.currentEditBannerId}`, updatedBanner)
      .pipe(
        catchError(error => {
          console.error('Error updating banner:', error);
          this.showNotification('Failed to update banner. Please try again.', 'error');
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.showNotification('Banner updated successfully!', 'success');
        this.fetchBanners();
        this.closeEditForm();
      });
  }

  private resetEditForm(): void {
    this.editImagePreview = null;
    this.editBannerForm.reset();
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = null;
      this.notificationType = null;
    }, 3000); 
  }

  deleteBanner(bannerId: number): void {
    console.log("BannerId:", bannerId);
    if (!confirm('Are you sure you want to delete this banner?')) return;
    this.http.delete(`${this.apiUrl}banner/${bannerId}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting banner:', error);
          this.showNotification('Failed to delete banner. Please try again.', 'error');
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.showNotification('Banner deleted successfully!', 'success');
        this.fetchBanners();
      });
  }

  private resetForm(): void {
    this.imagePreview = null;
    this.bannerForm.reset();
  }
}