import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificationRegisterPage } from './verification-register.page';

describe('VerificationRegisterPage', () => {
  let component: VerificationRegisterPage;
  let fixture: ComponentFixture<VerificationRegisterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
