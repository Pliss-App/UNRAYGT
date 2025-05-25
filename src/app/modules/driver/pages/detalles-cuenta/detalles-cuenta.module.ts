import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesCuentaPageRoutingModule } from './detalles-cuenta-routing.module';

import { DetallesCuentaPage } from './detalles-cuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesCuentaPageRoutingModule
  ],
  declarations: [DetallesCuentaPage]
})
export class DetallesCuentaPageModule {}
