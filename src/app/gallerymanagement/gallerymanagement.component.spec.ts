import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GallerymanagementComponent } from './gallerymanagement.component';

describe('GallerymanagementComponent', () => {
  let component: GallerymanagementComponent;
  let fixture: ComponentFixture<GallerymanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GallerymanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GallerymanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
