import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-gallerymanagement',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gallerymanagement.component.html',
  styleUrl: './gallerymanagement.component.scss',
})
export class GallerymanagementComponent {
  showBannerForm = false;
  imagePreview: string | null = null;
  bannerForm: FormGroup;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  banners: any[] = [];
  currentEditBannerId: number | null = null;
  editBannerForm: FormGroup;
  showEditBannerForm = false;
  editImagePreview: string | null = null;
  apiUrl = environment.base_url;

  isLoading = false;
  isDragging = false;
  errorMessage = '';
  previewImages: string[] = [];
  uploadedFiles: File[] = [];
  user_id: string;
  galleryImages: any;
  galleryCount: any;
  page: number = 1;
  pageSize: number = 10;
  totalImages: number = 0;
  isTooltipVisible: boolean = false;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.editBannerForm = this.fb.group({
      altText: [''],
    });
  }

  getServerImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/img/dummys.jpg';
    }
    if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:') || imagePath.startsWith('assets/')) {
      return imagePath;
    }
    return `${this.apiUrl}${imagePath.replace(/^\/+/, '')}`;
  }

  ngOnInit(): void {
    this.user_id = localStorage.getItem('userId');
    console.log('User id:', this.user_id);
    if (this.user_id) {
      this.fetchgalleryimage();
      // this.fetchpriorityimage();
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

  // Trigger hidden file input
  onDragOver(event: DragEvent): void {
    console.log('Drag Over', event);
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    console.log('Drag Leave', event);
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    console.log('Drop', event);
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  // File Selection Handler
  onFileSelect(event: Event): void {
    console.log('File Select', event);
    const input = event.target as HTMLInputElement;
    console.log('Files_input:', input);
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  // Handle Files
  handleFiles(files: FileList): void {
    console.log('File Handle', files);
    this.errorMessage = '';

    // Convert files to an array and check the total count of images
    const newFiles = Array.from(files);
    const totalFiles = this.uploadedFiles.length + newFiles.length;

    if (totalFiles > 5) {
      this.errorMessage = `You can only upload up to 5 images. You have already uploaded ${this.uploadedFiles.length}.`;
      return;
    }

    newFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        // Add the file to the uploadedFiles array
        this.uploadedFiles.push(file);

        // Generate preview for the image
        const reader = new FileReader();
        reader.onload = (e: any) => this.previewImages.push(e.target.result);
        reader.readAsDataURL(file);
      } else {
        this.errorMessage = 'Only image files are supported.';
      }
    });

    console.log('Uploaded Files:', this.uploadedFiles);
  }

  removeImage(index: number): void {
    // Remove the file and its preview
    this.uploadedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  uploadFiles(): void {
    if (this.uploadedFiles.length === 0) {
      this.errorMessage = 'Please select files to upload.';
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('userid', this.user_id);

    this.uploadedFiles.forEach((file, index) => {
      if (file instanceof File) {
        formData.append(`file_${index}`, file); // Use a unique key for each file
      } else {
        console.error('Invalid file object:', file);
      }
    });
    console.log('Form Data:', formData);

    this.http.post(`${this.apiUrl}uploads-gallery-img`, formData).subscribe(
      (response) => {
        console.log('Files uploaded successfully:', response);
        this.isLoading = false;
        // Clear uploaded files and previews after successful upload
        this.uploadedFiles = [];
        this.previewImages = [];
        this.showNotification('Files uploaded successfully!', 'success');
        this.fetchgalleryimage();
      },
      (error) => {
        console.error('Error uploading files:', error);
        this.errorMessage = 'Error uploading files. Please try again.';
        this.isLoading = false;
      }
    );
  }

  fetchgalleryimage(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }

    // Calculate offset
    const offset = (this.page - 1) * this.pageSize;

    this.http
      .get<any>(
        `${this.apiUrl}getgalleryimage/${userId}?page=${this.page}&pageSize=${this.pageSize}`
      )
      .subscribe(
        (response) => {
          console.log('Gallery Images:', response);
          this.galleryImages = response.data.rows;
          this.totalImages = response.data.count;
          this.galleryImages.forEach((banner: any) => {
            if (banner.total_checked == 2) {
              banner.file_paths.forEach((filePath: string) => {
                this.selectedFiles.add(filePath);
              });
            } else {
              if (banner.ischecked) {
                this.selectedFiles.add(banner.file_path);
              }
            }
          });
          if (this.galleryImages.total_checked) {
          } else {
          }
        },
        (error) => {
          console.error('Error fetching gallery images:', error);
        }
      );
  }

  changePage(page: number): void {
    this.page = page;
    this.fetchgalleryimage();
  }

  get totalPages(): number {
    return Math.ceil(this.totalImages / this.pageSize); // Calculate total pages
  }

  getDisplayedPages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.page;
    const displayedPages: number[] = [];

    if (totalPages <= 5) {
      // If total pages are less than or equal to 5, show all of them
      for (let i = 1; i <= totalPages; i++) {
        displayedPages.push(i);
      }
    } else {
      // Always show first two pages
      displayedPages.push(1, 2);

      // Show ellipsis if needed
      if (currentPage > 4) {
        displayedPages.push(-1); // -1 will represent ellipsis
      }

      // Show pages around current page
      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) {
        displayedPages.push(i);
      }

      // Always show last two pages
      if (currentPage < totalPages - 3) {
        displayedPages.push(-1); // -1 will represent ellipsis
        displayedPages.push(totalPages - 1, totalPages);
      }
    }

    return displayedPages;
  }

  private resetForm(): void {
    this.imagePreview = null;
    this.bannerForm.reset();
  }

  showEditForm(banner: any): void {
    console.log('Edit Banner (Text Fields Only):', banner);
    this.currentEditBannerId = banner.id;
    console.log('Edit Banner Form:', this.editBannerForm);
    this.editBannerForm.patchValue({
      altText: banner.alt_text || '',
    });
    this.editImagePreview = banner.file_path || '';
    this.showEditBannerForm = true;
  }

  deleteBanner(bannerId: number): void {
    console.log('BannerId:', bannerId);
    if (!confirm('Are you sure you want to delete this Gallery Image?')) return;
    this.http
      .delete(`${this.apiUrl}gallery-image/${bannerId}`)
      .pipe(
        catchError((error) => {
          console.error('Error deleting banner:', error);
          this.showNotification(
            'Failed to delete banner. Please try again.',
            'error'
          );
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.showNotification('Banner deleted successfully!', 'success');
        this.fetchgalleryimage();
      });
  }

  selectedFiles: Set<string> = new Set();

  onCheckboxChange(event: Event, filePath: string, userid: number): void {
    const checkbox = event.target as HTMLInputElement;
  
    if (checkbox.checked) {
      const confirmSelection = confirm('Do you want this image to appear in the search page?');
      if (confirmSelection) {
        if (this.selectedFiles.size >= 2) {
          alert('You can select a maximum of two images.');
          checkbox.checked = false;
          return;
        }
        this.selectedFiles.add(filePath);
        this.callApiToAdd(filePath, userid);
      } else {
        // User canceled selection
        checkbox.checked = false;
      }
    } else {
      const confirmUnselection = confirm('Do you want to unselect this image?');
      if (confirmUnselection) {
        this.selectedFiles.delete(filePath);
        this.callApiToRemove(filePath, userid);
      } else {
        // User canceled unselection
        checkbox.checked = true;
      }
    }
  }
  

  isChecked(filePath: string): boolean {
    return this.selectedFiles.has(filePath);
  }

  isMaxChecked(): boolean {
    return this.selectedFiles.size >= 2;
  }

  callApiToAdd(filePath: string, userid: number) {
    // Replace with your actual API endpoint and logic
    this.http
      .post(`${this.apiUrl}addpriorityimage`, {
        file_path: filePath,
        user_id: userid,
      })
      .subscribe((response) => {
        console.log('Added:', response);
      });
  }

  callApiToRemove(filePath: string, userid: number) {
    // Replace with your actual API endpoint and logic
    this.http
      .post(`${this.apiUrl}addpriorityimage`, {
        file_path: filePath,
        user_id: userid,
      })
      .subscribe((response) => {
        console.log('Removed:', response);
      });
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
      altText: this.bannerForm.value.altText,
      comments: this.bannerForm.value.comments,
      status: 'Active',
    };

    console.log('Dataaaa:', newBanner);

    this.http
      .post(`${this.apiUrl}insertBanner`, newBanner)
      .pipe(
        catchError((error) => {
          console.error('Error adding banner:', error);
          this.showNotification(
            'Failed to add banner. Please try again.',
            'error'
          );
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.showNotification('Banner added successfully!', 'success');
        // this.fetchBanners();
        // this.closeForm();
      });
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

  submitEditForm(): void {
    if (this.currentEditBannerId === null) {
      console.error('No banner ID set for editing');
      return;
    }

    const updatedBanner = {
      userid: localStorage.getItem('userId'),
      alt_text: this.editBannerForm.value.altText,
    };

    this.http
      .put(
        `${this.apiUrl}updateGallery/${this.currentEditBannerId}`,
        updatedBanner
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating banner:', error);
          this.showNotification(
            'Failed to update banner. Please try again.',
            'error'
          );
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.showNotification('Banner updated successfully!', 'success');
        // this.fetchBanners();
        this.fetchgalleryimage();
        this.closeEditForm();
      });
  }

  closeEditForm(): void {
    this.showEditBannerForm = false;
    this.resetEditForm();
  }

  private resetEditForm(): void {
    this.editImagePreview = null;
    this.editBannerForm.reset();
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
  showTooltip(): void {
    this.isTooltipVisible = true;
  }
  hideTooltip(): void {
    this.isTooltipVisible = false;
  }
}
