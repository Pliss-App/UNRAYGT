import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AplicacionPage } from './aplicacion.page';

const routes: Routes = [
  {
    path: '',
    component: AplicacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AplicacionPageRoutingModule {}
