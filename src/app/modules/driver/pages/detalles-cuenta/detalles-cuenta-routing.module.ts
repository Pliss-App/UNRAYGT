import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesCuentaPage } from './detalles-cuenta.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesCuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesCuentaPageRoutingModule {}
