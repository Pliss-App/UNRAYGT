import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CambiarmodoPageRoutingModule } from './cambiarmodo-routing.module';

import { CambiarmodoPage } from './cambiarmodo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambiarmodoPageRoutingModule
  ],
  declarations: [CambiarmodoPage]
})
export class CambiarmodoPageModule {}
