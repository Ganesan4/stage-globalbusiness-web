import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeCartComponent } from './upgrade-cart.component';

describe('UpgradeCartComponent', () => {
  let component: UpgradeCartComponent;
  let fixture: ComponentFixture<UpgradeCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeCartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpgradeCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
