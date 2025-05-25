import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialBilleteraPage } from './historial-billetera.page';

describe('HistorialBilleteraPage', () => {
  let component: HistorialBilleteraPage;
  let fixture: ComponentFixture<HistorialBilleteraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialBilleteraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
