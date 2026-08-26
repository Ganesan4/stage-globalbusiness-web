
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WebService } from '../services/web.service';
import { CountService } from '../services/count.service';

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
  isAffiliateUser: boolean = false;
  dropMenu = false;
  formattedCount: any;

  constructor(private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private web: WebService,
    private countService: CountService
  ) { }


  ngOnInit(): void {
    this.updateUserId();
    this.updateAffiliateStatus();
    this.updateLoginStatus();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.updateUserId();
        this.updateAffiliateStatus();
        this.updateLoginStatus();
      });
    }

    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.updateAffiliateStatus();
      this.cdr.detectChanges();
    });
  }
  updateUserId(): void {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId');
    }
    this.cdr.detectChanges();
  }
  updateAffiliateStatus(): void {
    if (typeof window !== 'undefined') {
      this.isAffiliateUser = localStorage.getItem('affiliateUser') === 'true';
      console.log('[Header] isAffiliateUser:', this.isAffiliateUser, 'affiliateUser val:', localStorage.getItem('affiliateUser'));
    }
    this.cdr.detectChanges();
  }
  updateLoginStatus(): void {
    if (typeof window !== 'undefined') {
      const isReg = localStorage.getItem('isLoggedIn') === 'true';
      const isAff = localStorage.getItem('affiliateUser') === 'true';
      this.isLoggedIn = isReg || isAff;
      console.log('[Header] isLoggedIn:', this.isLoggedIn, 'isLoggedIn:', isReg, 'isAffiliateUser:', isAff);
    }
    this.cdr.detectChanges();
  }

  removeUserId(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
    this.updateUserId(); // Update userId and trigger change detection
  }
  toggleMenu() {
    // this.ngOnInit();
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollTo(sectionId: string): void {
    // Close mobile menu
    this.isMenuOpen = false;

    // If not on homepage, navigate there first
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToSection(sectionId), 300);
      });
    } else {
      this.scrollToSection(sectionId);
    }
  }

  private scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  opendropmenu() {
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

  getMyAccountLink(): string {
    return this.isAffiliateUser ? '/account/affiliate-dashboard' : '/account';
  }

  getMyAccountText(): string {
    return this.isAffiliateUser ? 'My Profile' : 'My Account';
  }

  forceReload() {
    window.location.href = '/register';
  }

  getTotalCount() {
    this.web.getData('getTotalCount').then((response) => {
      console.log("response", response);

      let formattedCount: string; // Declare the variable

      if (response == undefined) {
        formattedCount = '0'; // Assign to formattedCount, not this.formattedCount
      } else if (response >= 1000 * 1000 * 1000) {
        formattedCount = (response / (1000 * 1000 * 1000)).toFixed(1) + ' Billions';
      } else if (response >= 1000 * 1000) {
        formattedCount = (response / (1000 * 1000)).toFixed(1) + ' Millions';
      } else if (response >= 1000) {
        formattedCount = (response / 1000).toFixed(1) + ' Thousand';
      } else {
        formattedCount = response.toString();
      }

      // Now both assignments use the same variable
      this.formattedCount = formattedCount;

      // console.log("formattedCount", formattedCount);
      // console.log("formattedCount type", typeof(formattedCount));

      // This will now pass the correct value to the service
      this.countService.setTotalCount(formattedCount);
    }).catch(error => {
      console.error('Error fetching total count:', error);
      this.countService.setTotalCount('0');
    });
  }
}
