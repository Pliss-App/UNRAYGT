import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModoconductorPage } from './modoconductor.page';

describe('ModoconductorPage', () => {
  let component: ModoconductorPage;
  let fixture: ComponentFixture<ModoconductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModoconductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
