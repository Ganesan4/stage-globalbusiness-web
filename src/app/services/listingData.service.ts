import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ListingDataService {

  private dataSubject = new BehaviorSubject<any>(this.getDataFromLocalStorage());
  public data$: Observable<any> = this.dataSubject.asObservable();

  constructor() {}

  private getDataFromLocalStorage(): any {
    try {
      const storedData = localStorage.getItem('existData');
      return storedData ? JSON.parse(storedData) : undefined;
    } catch (e) {
      return undefined;
    }
  }

  setData(value: any) {
    this.dataSubject.next(value);
    localStorage.setItem('existData', JSON.stringify(value));
  }

  /** Drop a previously loaded directory listing so a new $1.30 signup stays blank. */
  clearData(): void {
    localStorage.removeItem('existData');
    this.dataSubject.next(undefined);
  }

  getData(): Observable<any> {
    console.log("data",this.data$);
      return this.data$;
  }

}