import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpdrComponent } from './gpdr.component';

describe('GpdrComponent', () => {
  let component: GpdrComponent;
  let fixture: ComponentFixture<GpdrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpdrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GpdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
