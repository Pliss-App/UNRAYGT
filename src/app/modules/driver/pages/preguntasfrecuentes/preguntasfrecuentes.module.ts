import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreguntasfrecuentesPageRoutingModule } from './preguntasfrecuentes-routing.module';

import { PreguntasfrecuentesPage } from './preguntasfrecuentes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreguntasfrecuentesPageRoutingModule
  ],
  declarations: [PreguntasfrecuentesPage]
})
export class PreguntasfrecuentesPageModule {}
