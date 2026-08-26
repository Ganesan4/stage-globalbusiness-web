import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeCategoryComponent } from './upgrade-category.component';

describe('UpgradeCategoryComponent', () => {
  let component: UpgradeCategoryComponent;
  let fixture: ComponentFixture<UpgradeCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpgradeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
