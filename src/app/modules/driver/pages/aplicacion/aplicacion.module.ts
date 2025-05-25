import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AplicacionPageRoutingModule } from './aplicacion-routing.module';

import { AplicacionPage } from './aplicacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AplicacionPageRoutingModule
  ],
  declarations: [AplicacionPage]
})
export class AplicacionPageModule {}
