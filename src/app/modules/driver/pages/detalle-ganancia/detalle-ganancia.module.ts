import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleGananciaPageRoutingModule } from './detalle-ganancia-routing.module';

import { DetalleGananciaPage } from './detalle-ganancia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleGananciaPageRoutingModule
  ],
  declarations: [DetalleGananciaPage]
})
export class DetalleGananciaPageModule {}
