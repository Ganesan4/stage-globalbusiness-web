import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl ,FormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-useraccess',
  templateUrl: './useraccess.component.html',
  styleUrls: ['./useraccess.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  standalone: true
})
export class UseraccessComponent implements OnInit {
  isUserModalOpen = false;
  isUserEditModalOpen = false;
  userForm: FormGroup;
  userEditForm: FormGroup;
  currentEditUserId: number | null = null;
  users: any[] = [];
  isLoading = false;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  showDeleteModal = false; 
  userIdToDelete: number | null = null; 
  apiUrl = environment.base_url;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      status: ['Active', Validators.required]
    }, { validators: this.passwordsMatchValidator });

    this.userEditForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      oldPassword: [''],
      newPassword: ['', Validators.minLength(6)],
      status: ['Active', Validators.required]
    }, { validators: this.requireOldPasswordIfNewPassword },
    );
  
  }
  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
  
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  requireOldPasswordIfNewPassword(): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const oldPassword = formGroup.get('oldPassword')?.value;
      const newPassword = formGroup.get('newPassword')?.value;
  
      if (newPassword && !oldPassword) {
        return { oldPasswordRequired: true };
      }
      if (oldPassword && !newPassword) {
        return { newPasswordRequired: true };
      }
      return null;
    };
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    const user_id = localStorage.getItem('userId');
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}getAllUsers/${user_id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return throwError(() => error);
        })
      )
      .subscribe(data => {
        console.log("data:", data);
        this.users = data;
        this.isLoading = false;
      });
  }

  openAddUserModal(): void {
    this.isUserModalOpen = true;
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
    this.userForm.reset();
  }

  // submitUserForm(): void {
  //   if (this.userForm.invalid) {
  //     this.userForm.markAllAsTouched();
  //     return;
  //   }

  //   const createdBy = localStorage.getItem('userId');

  //   const newUser = {
  //     username: this.userForm.value.username,
  //     email: this.userForm.value.email,
  //     password: this.userForm.value.password,
  //     status: this.userForm.value.status,
  //     createdBy: createdBy
  //   };

  //   this.http.post(`${this.apiUrl}/insertUserAccess`, newUser)
  //     .pipe(
  //       catchError(error => {
  //         console.error('Error adding user:', error);
  //         this.showNotification('Failed to add user. Please try again.', 'error');
  //         return throwError(() => error);
  //       })
  //     )
  //     .subscribe(() => {
  //       this.showNotification('User added successfully!', 'success');
  //       this.fetchUsers();
  //       this.closeUserModal();
  //     });
  // }
  openDeleteModal(userId: number): void {
    this.userIdToDelete = userId;
    this.showDeleteModal = true;
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userIdToDelete = null;
  }

  submitUserForm(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
  
    const createdBy = localStorage.getItem('userId');
  
    const newUser = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      status: this.userForm.value.status,
      createdBy: createdBy
    };
  
    this.http.post(`${this.apiUrl}insertUserAccess`, newUser)
      .pipe(
        catchError(error => {
          console.error('Error adding user:', error);
  
          if (error.status === 409 && error.error.status === 'email_exists') {
            this.showNotification('Email already exists. Please use a different email.', 'error');
          } else {
            this.showNotification('Failed to add user. Please try again.', 'error');
          }
  
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.showNotification('User added successfully!', 'success');
        this.fetchUsers();
        this.closeUserModal();
      });
  }

  openEditUserModal(user: any): void {
    this.currentEditUserId = user.id;
    const statusValue = user.status === '3' ? 'Active' : 'Inactive';
    this.userEditForm.patchValue({
      username: user.username,
      email: user.email,
      status: statusValue
    });
    console.log('Form values after patching:', this.userEditForm.value);
    this.isUserEditModalOpen = true;
  }

  closeUserEditModal(): void {
    this.isUserEditModalOpen = false;
    this.userEditForm.reset();
  }

  submitUserEditForm(): void {
    if (this.userEditForm.invalid) {
      this.userEditForm.markAllAsTouched();
      return;
    }
  
    if (this.currentEditUserId === null) {
      console.error('No user ID set for editing');
      return;
    }
  
    const updatedUser: { [key: string]: any } = {
      username: this.userEditForm.value.username,
      email: this.userEditForm.value.email,
      status: this.userEditForm.value.status
    };
  
    if (this.userEditForm.value.newPassword) {
      updatedUser['newPassword'] = this.userEditForm.value.newPassword;
      updatedUser['oldPassword'] = this.userEditForm.value.oldPassword;
    }

    console.log("UpdatedUser:", updatedUser);
  
    this.http.put(`${this.apiUrl}updateUser/${this.currentEditUserId}`, updatedUser)
      .pipe(
        catchError(error => {
          let errorMessage = 'An error occurred. Please try again later.';
          
          // Handle different error statuses and display appropriate messages
          if (error.status === 400) {
            errorMessage = 'Invalid input. Please check your data.';
          } else if (error.status === 404) {
            errorMessage = 'User not found.';
          } else if (error.status === 401 && error.error.message === "Old password is incorrect") {
            errorMessage = 'Old password does not match. Please try again.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
  
          this.showNotification(errorMessage, 'error');
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        if (response) {
          this.showNotification('User updated successfully!', 'success');
          this.fetchUsers();
          this.closeUserEditModal();
        }
      });
  }  

confirmDelete(): void {
  if (!this.userIdToDelete) return;

  this.http.delete(`${this.apiUrl}deleteUser/${this.userIdToDelete}`)
    .pipe(
      catchError(error => {
        console.error('Error deleting user:', error);
        this.showNotification('Failed to delete user. Please try again.', 'error');
        return throwError(() => error);
      })
    )
    .subscribe(() => {
      this.showNotification('User deleted successfully!', 'success');
      this.fetchUsers();
      this.closeDeleteModal(); 
    });
}

  private passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
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
