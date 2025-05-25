import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreguntasfrecuentesPage } from './preguntasfrecuentes.page';

describe('PreguntasfrecuentesPage', () => {
  let component: PreguntasfrecuentesPage;
  let fixture: ComponentFixture<PreguntasfrecuentesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreguntasfrecuentesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
