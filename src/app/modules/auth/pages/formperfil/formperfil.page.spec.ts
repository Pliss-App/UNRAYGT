import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormperfilPage } from './formperfil.page';

describe('FormperfilPage', () => {
  let component: FormperfilPage;
  let fixture: ComponentFixture<FormperfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormperfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
