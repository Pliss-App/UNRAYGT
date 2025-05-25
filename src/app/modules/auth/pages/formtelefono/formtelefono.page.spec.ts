import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormtelefonoPage } from './formtelefono.page';

describe('FormtelefonoPage', () => {
  let component: FormtelefonoPage;
  let fixture: ComponentFixture<FormtelefonoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormtelefonoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
