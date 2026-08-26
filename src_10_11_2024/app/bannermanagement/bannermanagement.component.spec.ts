import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannermanagementComponent } from './bannermanagement.component';

describe('BannermanagementComponent', () => {
  let component: BannermanagementComponent;
  let fixture: ComponentFixture<BannermanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannermanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BannermanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
