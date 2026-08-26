import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  apiUrl = environment.base_url;
  private baseUrl = `${this.apiUrl}search`;
  private locationbaseUrl = `${this.apiUrl}searchForListLocation`;
  // private indexUrl = `${this.apiUrl}index`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any> {
    return this.http.get<any>(this.baseUrl, { params: { q: query } });
  }
  searchlocation(query: string): Observable<any> {
    return this.http.get<any>(this.locationbaseUrl, { params: { q: query } });
  }

  // index(): Observable<any> {
  //   return this.http.post<any>(this.indexUrl, {});
  // }
}
