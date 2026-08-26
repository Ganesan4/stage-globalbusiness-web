import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { WebService } from '../services/web.service';

@Component({
  selector: 'app-sales-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-popup.component.html',
  styleUrl: './sales-popup.component.scss'
})
export class SalesPopupComponent implements OnInit {

  isOpen = true;
  recentSales: any[] = [];

  constructor(public web: WebService) { }

  ngOnInit(): void {
    this.getRecentSales();
  }

  closePopup() {
    this.isOpen = false;
  }

  openPopup() {
    this.getRecentSales();
    this.isOpen = true;
  }

  getRecentSales() {
    this.web.getData('getRecentSales')
      .then((res: any) => {
        if (res.status === 'success') {
          this.recentSales = res.data.map((item: any) => {
            return `${item.business_name} from ${item.country} just purchased this item!`;
          });
        }
        console.log('Recent Sales:', this.recentSales);
      })
      .catch(err => console.log(err));
  }


}
