import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModoconductorPageRoutingModule } from './modoconductor-routing.module';

import { ModoconductorPage } from './modoconductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModoconductorPageRoutingModule
  ],
  declarations: [ModoconductorPage]
})
export class ModoconductorPageModule {}
