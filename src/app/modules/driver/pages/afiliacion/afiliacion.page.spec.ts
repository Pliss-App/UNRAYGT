import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfiliacionPage } from './afiliacion.page';

describe('AfiliacionPage', () => {
  let component: AfiliacionPage;
  let fixture: ComponentFixture<AfiliacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AfiliacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
