import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { TravelRoutePageRoutingModule } from './travel-route-routing.module';

import { TravelRoutePage } from './travel-route.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TravelRoutePageRoutingModule
  ],
  declarations: [TravelRoutePage]
})
export class TravelRoutePageModule {}
