import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AyudaBoletaPageRoutingModule } from './ayuda-boleta-routing.module';

import { AyudaBoletaPage } from './ayuda-boleta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AyudaBoletaPageRoutingModule
  ],
  declarations: [AyudaBoletaPage]
})
export class AyudaBoletaPageModule {}
