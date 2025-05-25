import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionlocationPage } from './permissionlocation.page';

describe('PermissionlocationPage', () => {
  let component: PermissionlocationPage;
  let fixture: ComponentFixture<PermissionlocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionlocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
