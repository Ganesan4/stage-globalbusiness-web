import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',  // This will make it a singleton
})
export class WebService {
  private apiUrl = environment.base_url;  // Replace with your API URL

  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
  ) { }

  getData(controller:any): Promise<any> {
    // var token = localStorage.getItem('admintoken')
    // console.log("controller",this.url)
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.apiUrl}`+controller, {
        headers:
        new HttpHeaders(
          {
            'Content-Type': 'application/json;  charset=UTF-8',
            // 'Authorization': 'Bearer '+ token
          }
        )
      }).subscribe((response: any) => {
        if(response.status=="authentication_error"){
          this.auth.logout();
        }
        else{
          resolve(response);
        }
      }, (response1: any) => {
        if(!response1.error){
          reject(false);
          return;
        }
        if(response1.error.status=="authentication_error"){
          this.auth.logout();
        }
        else{
          reject(response1);
        }
      });
    });
  }

    /**
   * Universal post
   * @param params
   */

    async postData(controller: any, data: any): Promise<any> {
      try {
        console.log('data',`${this.apiUrl}${controller}`, data);
        // const token = localStorage.getItem('admintoken');
        const response: any = await this._httpClient.post(
          `${this.apiUrl}${controller}`,
          { ...data },
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json; charset=UTF-8',
            }),
          }
        ).toPromise();
    
        console.log('response', response);
    
        if (response.status === "authentication_error") {
          this.auth.logout();
          return;
        }
    
        return response;
    
      } catch (error: any) {
        console.error('error', error);
    
        if (!error || !error.error) {
          throw new Error("Unknown error occurred");
        }
    
        if (error.error.status === "authentication_error") {
          this.auth.logout();
          return;
        }
    
        throw error;
      }
    }
    
}

