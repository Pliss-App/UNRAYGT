import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AplicacionPage } from './aplicacion.page';

describe('AplicacionPage', () => {
  let component: AplicacionPage;
  let fixture: ComponentFixture<AplicacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AplicacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
