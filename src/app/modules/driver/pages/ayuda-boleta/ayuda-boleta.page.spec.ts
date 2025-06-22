import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AyudaBoletaPage } from './ayuda-boleta.page';

describe('AyudaBoletaPage', () => {
  let component: AyudaBoletaPage;
  let fixture: ComponentFixture<AyudaBoletaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AyudaBoletaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
