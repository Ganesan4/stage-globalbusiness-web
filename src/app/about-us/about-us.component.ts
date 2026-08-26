import { Component } from '@angular/core';
import { WebService } from '../services/web.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom 
})
export class AboutUsComponent {

    aboutus_content: any[];
    
      constructor(private web: WebService) { }
     
      ngOnInit(): void {
        this.getaboutus();
      }
    
      getaboutus(){
        this.web.getData('getAboutUs').then((response: any) => {
          console.log("response12",response);
          this.aboutus_content = response.data[0].aboutus_content;
        })
      }

}
