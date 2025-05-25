import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TravelRoutePage } from './travel-route.page';

const routes: Routes = [
  {
    path: '',
    component: TravelRoutePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelRoutePageRoutingModule {}
