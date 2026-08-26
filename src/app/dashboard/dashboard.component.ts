import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// import { SetScheduleComponent } from "../set-schedule/set-schedule.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
constructor(private router: Router) {}
isSidebarOpen = false;

toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

toggleSidebar_close(){
  this.isSidebarOpen = false;
}
goToUpgrade() {
  this.router.navigate(['/upgrade']);
}
}
