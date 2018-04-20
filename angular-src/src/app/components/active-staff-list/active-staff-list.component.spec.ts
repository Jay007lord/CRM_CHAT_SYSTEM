import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveStaffListComponent } from './active-staff-list.component';

describe('ActiveStaffListComponent', () => {
  let component: ActiveStaffListComponent;
  let fixture: ComponentFixture<ActiveStaffListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveStaffListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveStaffListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
