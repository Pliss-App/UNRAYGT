import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReferidosPageRoutingModule } from './referidos-routing.module';

import { ReferidosPage } from './referidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReferidosPageRoutingModule
  ],
  declarations: [ReferidosPage]
})
export class ReferidosPageModule {}
