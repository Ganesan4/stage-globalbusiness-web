import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingdetailsComponent } from './listingdetails.component';

describe('ListingdetailsComponent', () => {
  let component: ListingdetailsComponent;
  let fixture: ComponentFixture<ListingdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListingdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
