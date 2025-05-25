import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormnombresPage } from './formnombres.page';

describe('FormnombresPage', () => {
  let component: FormnombresPage;
  let fixture: ComponentFixture<FormnombresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormnombresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
