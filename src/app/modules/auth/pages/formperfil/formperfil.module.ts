import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormperfilPageRoutingModule } from './formperfil-routing.module';

import { FormperfilPage } from './formperfil.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormperfilPageRoutingModule
  ],
  declarations: [FormperfilPage]
})
export class FormperfilPageModule {}
