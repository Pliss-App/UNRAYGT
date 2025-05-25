import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RecargarBilleteraPageRoutingModule } from './recargar-billetera-routing.module';

import { RecargarBilleteraPage } from './recargar-billetera.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RecargarBilleteraPageRoutingModule
  ],
  declarations: [RecargarBilleteraPage]
})
export class RecargarBilleteraPageModule {}
