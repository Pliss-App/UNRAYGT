import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormnombresPageRoutingModule } from './formnombres-routing.module';

import { FormnombresPage } from './formnombres.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FormnombresPageRoutingModule

  ],
  declarations: [FormnombresPage]
})
export class FormnombresPageModule { }
