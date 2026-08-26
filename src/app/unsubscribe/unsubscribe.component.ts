import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebService } from '../services/web.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-unsubscribe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unsubscribe.component.html',
  styleUrl: './unsubscribe.component.scss'
})
export class UnsubscribeComponent {
  token: string | null = null;
  loaded!: boolean
  success: boolean = false

  constructor(private route: ActivatedRoute, private web: WebService) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');    
    this.unsubscribe()
  }

  unsubscribe() {        
    this.web.postData('unsubscribe', {token: this.token}).then((res) => {
      if (res.status){    
        console.log("here")    
        this.success = true
        this.loaded = true        
      } else {
        console.log("here")    
        this.loaded = true
    }}, err => {
      console.log(err)
      this.loaded = true
    })
  }    
}
