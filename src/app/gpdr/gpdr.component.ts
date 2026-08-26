import { Component } from '@angular/core';
import { WebService } from '../services/web.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-gpdr',
  standalone: true,
  imports: [],
  templateUrl: './gpdr.component.html',
  styleUrls: ['./gpdr.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom 
})
export class GpdrComponent {

      gdpr_content: any[];
      
        constructor(private web: WebService) { }
       
        ngOnInit(): void {
          this.getgdpr();
        }
      
        getgdpr(){
          this.web.getData('getAllGdpr').then((response: any) => {
            console.log("response12",response);
            this.gdpr_content = response.data[0].gdpr_content;
          })
        }
}
