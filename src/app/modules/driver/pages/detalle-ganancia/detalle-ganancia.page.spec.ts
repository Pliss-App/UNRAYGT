import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleGananciaPage } from './detalle-ganancia.page';

describe('DetalleGananciaPage', () => {
  let component: DetalleGananciaPage;
  let fixture: ComponentFixture<DetalleGananciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleGananciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
