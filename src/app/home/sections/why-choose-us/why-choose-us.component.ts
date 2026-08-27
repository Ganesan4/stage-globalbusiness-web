import { Component, OnInit } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.scss'
})
export class WhyChooseUsComponent implements OnInit {
  whyChooseUsData: any = {};
  httpUrl = environment.base_url;
  contentLoaded: boolean = false;
  safeContent!: SafeHtml;

  constructor(
    private web: WebService,
    private sanitizer: DomSanitizer
  ) {
    this.getWhyChooseUsData();

  }

  ngOnInit(): void {

  }

  getWhyChooseUsData() {
    this.web.getData('getWhychooseus').then((res) => {
      if (res.status && res.data.length > 0) {
        this.whyChooseUsData = res.data[0];

        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.whyChooseUsData.content);
      }
      this.contentLoaded = true;
    }).catch(err => {
      console.log(err);
      this.contentLoaded = true;
    });
  }
}

