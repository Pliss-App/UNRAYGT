import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionesboletaPage } from './gestionesboleta.page';

describe('GestionesboletaPage', () => {
  let component: GestionesboletaPage;
  let fixture: ComponentFixture<GestionesboletaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionesboletaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
