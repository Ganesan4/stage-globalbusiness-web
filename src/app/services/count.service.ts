import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CountService {
    private totalCountSubject = new BehaviorSubject<string>('0');
    public totalCount$ = this.totalCountSubject.asObservable();

    constructor() { }

    setTotalCount(count: string): void {
        // console.log('Count updated1:', count);
        this.totalCountSubject.next(count);
        if (typeof window !== 'undefined') {
          localStorage.setItem('totalCount', count);
        }
    }

    getTotalCount(): string {
        return this.totalCountSubject.getValue();
    }

    // Initialize from localStorage if available
    initializeFromStorage(): void {
        if (typeof window !== 'undefined') {
          const storedCount = localStorage.getItem('totalCount');
          if (storedCount) {
              this.totalCountSubject.next(storedCount);
          }
        }
    }
}