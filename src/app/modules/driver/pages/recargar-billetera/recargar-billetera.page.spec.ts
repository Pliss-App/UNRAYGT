import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecargarBilleteraPage } from './recargar-billetera.page';

describe('RecargarBilleteraPage', () => {
  let component: RecargarBilleteraPage;
  let fixture: ComponentFixture<RecargarBilleteraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecargarBilleteraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
