import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificationRegisterPageRoutingModule } from './verification-register-routing.module';

import { VerificationRegisterPage } from './verification-register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificationRegisterPageRoutingModule
  ],
  declarations: [VerificationRegisterPage]
})
export class VerificationRegisterPageModule {}
