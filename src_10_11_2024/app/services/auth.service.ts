import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSource = new BehaviorSubject<boolean>(this.checkInitialLoginState());
  isLoggedIn$ = this.loggedInSource.asObservable();

  constructor(private router: Router) {}

  private checkInitialLoginState(): boolean {
    // Check if `localStorage` is available
    if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') {
      return true;
    }
    return false;
  }

  setLoggedIn(value: boolean) {
    this.loggedInSource.next(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', value ? 'true' : 'false');
    }
  }

  logout(): void {
    this.setLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/login']).then(() => {
      window.history.pushState(null, '', window.location.href);
    });
  }
  
}
