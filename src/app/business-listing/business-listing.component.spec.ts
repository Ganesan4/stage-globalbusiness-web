import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessListingComponent } from './business-listing.component';

describe('BusinessListingComponent', () => {
  let component: BusinessListingComponent;
  let fixture: ComponentFixture<BusinessListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessListingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
