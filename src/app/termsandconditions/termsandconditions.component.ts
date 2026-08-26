import { Component } from '@angular/core';
import { WebService } from '../services/web.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-termsandconditions',
  standalone: true,
  imports: [],
  templateUrl: './termsandconditions.component.html',
  styleUrls: ['./termsandconditions.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom 
})
export class TermsandconditionsComponent {
  termsandconditions: any[];

  constructor(private web: WebService) { }
 
  ngOnInit(): void {
    this.gettermsandconditions();
  }

  gettermsandconditions(){
    this.web.getData('getTerms_use').then((response: any) => {
      console.log("response12",response);
      this.termsandconditions = response.data[0].terms_content;
    })
  }

}
