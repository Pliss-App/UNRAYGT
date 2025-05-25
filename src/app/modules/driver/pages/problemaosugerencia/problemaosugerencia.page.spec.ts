import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProblemaosugerenciaPage } from './problemaosugerencia.page';

describe('ProblemaosugerenciaPage', () => {
  let component: ProblemaosugerenciaPage;
  let fixture: ComponentFixture<ProblemaosugerenciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemaosugerenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
