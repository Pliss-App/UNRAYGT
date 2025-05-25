import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambiarmodoPage } from './cambiarmodo.page';

describe('CambiarmodoPage', () => {
  let component: CambiarmodoPage;
  let fixture: ComponentFixture<CambiarmodoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiarmodoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
