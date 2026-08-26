
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit ,ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userId: string | null = null;
  isModalOpen = false;
  isMenuOpen = false;
  currentRoute: string = '';
  isLoggedIn: boolean = false;
  dropMenu = false;
  
  constructor(private router: Router,private authService: AuthService,private cdr: ChangeDetectorRef) {}

  
  ngOnInit(): void {
    this.updateUserId();

    // Optional: Watch for localStorage changes using `storage` event
    window.addEventListener('storage', () => {
      this.updateUserId();
    });
    
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      console.log("this.isLoggedIn",this.isLoggedIn);
      
    });
  }
  updateUserId(): void {
    this.userId = localStorage.getItem('userId');
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  removeUserId(): void {
    localStorage.removeItem('userId');
    this.updateUserId(); // Update userId and trigger change detection
  }
  toggleMenu() {
    this.ngOnInit();
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Open the modal
  openModal() {
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
  }

  logout() {
    this.authService.logout();
  }

  // Check if current route is the Home route ('/')
  isHomeRoute(): boolean {
    console.log(this.currentRoute);
    return this.currentRoute === '/'; // Only show the button on the home route
  }

  opendropmenu(){
    console.log(this.dropMenu);
    this.dropMenu = !this.dropMenu;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const targetElement = event.target as HTMLElement;

    // Check if the click target is outside the dropdown or its toggle
    if (
      this.dropMenu &&
      !targetElement.closest('#dropdown-example') &&
      !targetElement.closest('[data-collapse-toggle="dropdown-example"]')
    ) {
      this.dropMenu = false;
    }
  }

  selectDropdownValue(value: string) {
    this.dropMenu = false;
    this.router.navigate([`/business-directory/${value}`]); 
  }
}