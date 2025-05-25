import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialBilleteraPageRoutingModule } from './historial-billetera-routing.module';

import { HistorialBilleteraPage } from './historial-billetera.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialBilleteraPageRoutingModule
  ],
  declarations: [HistorialBilleteraPage]
})
export class HistorialBilleteraPageModule {}
