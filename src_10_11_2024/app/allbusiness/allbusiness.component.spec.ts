import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllbusinessComponent } from './allbusiness.component';

describe('AllbusinessComponent', () => {
  let component: AllbusinessComponent;
  let fixture: ComponentFixture<AllbusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllbusinessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllbusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
