import { Component } from '@angular/core';
import { WebService } from '../services/web.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom 
})
export class PrivacyPolicyComponent {
  privacy_policy_content: any[];
  
    constructor(private web: WebService) { }
   
    ngOnInit(): void {
      this.getprivacypolicy();
    }
  
    getprivacypolicy(){
      this.web.getData('getPrivacyPolicy').then((response: any) => {
        console.log("response12",response);
        this.privacy_policy_content = response.data[0].privacy_policy_content;
      })
    }

}
