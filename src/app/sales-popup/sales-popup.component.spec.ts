import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPopupComponent } from './sales-popup.component';

describe('SalesPopupComponent', () => {
  let component: SalesPopupComponent;
  let fixture: ComponentFixture<SalesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
