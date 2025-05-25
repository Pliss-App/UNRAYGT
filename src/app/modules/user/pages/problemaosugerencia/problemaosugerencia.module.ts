import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProblemaosugerenciaPageRoutingModule } from './problemaosugerencia-routing.module';

import { ProblemaosugerenciaPage } from './problemaosugerencia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProblemaosugerenciaPageRoutingModule
  ],
  declarations: [ProblemaosugerenciaPage]
})
export class ProblemaosugerenciaPageModule {}
