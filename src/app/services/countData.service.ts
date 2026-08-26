import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CountDataService {

  private dataSubject = new BehaviorSubject<any>(this.getDataFromLocalStorage());
  public data$: Observable<any> = this.dataSubject.asObservable();

  constructor() {}

  private getDataFromLocalStorage(): any {
    try {
      const storedData = localStorage.getItem('count');
      return storedData ? JSON.parse(storedData) : undefined;
    } catch (e) {
      return undefined;
    }
  }

  setData(value: any) {
    this.dataSubject.next(value);
    localStorage.setItem('count', JSON.stringify(value));
  }

  getData(): Observable<any> {
    console.log("data",this.data$);
      return this.data$;
  }
}