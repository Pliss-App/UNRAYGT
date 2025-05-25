import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TravelRoutePage } from './travel-route.page';

describe('TravelRoutePage', () => {
  let component: TravelRoutePage;
  let fixture: ComponentFixture<TravelRoutePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelRoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
