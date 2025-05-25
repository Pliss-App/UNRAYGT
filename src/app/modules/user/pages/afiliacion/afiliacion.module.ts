import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { AfiliacionPageRoutingModule } from './afiliacion-routing.module';

import { AfiliacionPage } from './afiliacion.page';
import { register } from 'swiper/element/bundle';
// Registra los elementos de Swiper
register();

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AfiliacionPageRoutingModule
  ],
  declarations: [AfiliacionPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AfiliacionPageModule {}
