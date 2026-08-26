import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WebService } from '../services/web.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {
  alreadysetdata: any;
  alreadyset: any;

  constructor(private web: WebService,private router: Router,private authService: AuthService){}

  isSidebarOpen = true;
  isUserRole: boolean = false;
  isAffiliateUser: boolean = false;
  isModalOpen = false;
  isDropDownOpen = true;
  days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedDay: string;
  

  ngOnInit(){
    const user_id = localStorage.getItem('userId');
    this.isAffiliateUser = localStorage.getItem('affiliateUser') === 'true';
  
    if(user_id){
      this.mysetschedule(user_id);
    }

      const userRole = localStorage.getItem('userRole');
      
      this.isUserRole = userRole === 'user';
  }

  toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
  toggleSidebar_close(){
    this.isSidebarOpen = false;
  }

  openModal(){
    this.isModalOpen = true;
  }

  opendropdown(){
    this.isDropDownOpen = !this.isDropDownOpen;
  }

  toggleDay(day: string): void {
    // if (this.selectedDay.includes(day)) {
    //   this.selectedDay = this.selectedDay.filter(selectedDay => selectedDay !== day);
    // } else {
    //   this.selectedDay.push(day);
    // }
    this.alreadyset = day;
    // this.selectedDay = day

  
  }
  
  async setSchedule(){
    const userid = localStorage.getItem('userId');
    try{
    this.isModalOpen = false;
    console.log('appi',this.selectedDay);
    const res = await this.web.postData('setSchedule', {schedule_day: this.alreadyset, user_id :userid})
      if(res){
        // console.log('resultt',res);
      }
  } catch(err){
    console.log(err);
  }
}

async mysetschedule(user_id: string){
  const id = user_id
  try{
  const res = await this.web.postData('mysetschedule', {user_id :id})
    if(res.status){
      this.alreadysetdata = JSON.parse(res.message);
      this.alreadyset = this.alreadysetdata.schedule_day || '';
    }
} catch(err){
  console.log(err);
}

}

logout() {
  this.authService.logout();
}

closeModal(){
  this.isModalOpen = false;
  this.mysetschedule(localStorage.getItem('userId'));
}
}
