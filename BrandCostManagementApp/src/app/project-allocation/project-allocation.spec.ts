import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAllocation } from './project-allocation';

describe('ProjectAllocation', () => {
  let component: ProjectAllocation;
  let fixture: ComponentFixture<ProjectAllocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAllocation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAllocation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
