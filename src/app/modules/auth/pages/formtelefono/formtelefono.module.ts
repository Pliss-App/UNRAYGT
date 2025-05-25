import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormtelefonoPageRoutingModule } from './formtelefono-routing.module';

import { FormtelefonoPage } from './formtelefono.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormtelefonoPageRoutingModule
  ],
  declarations: [FormtelefonoPage]
})
export class FormtelefonoPageModule {}
