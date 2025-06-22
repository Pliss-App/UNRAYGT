import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionesboletaPageRoutingModule } from './gestionesboleta-routing.module';

import { GestionesboletaPage } from './gestionesboleta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionesboletaPageRoutingModule
  ],
  declarations: [GestionesboletaPage]
})
export class GestionesboletaPageModule {}
