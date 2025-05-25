import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleGananciaPage } from './detalle-ganancia.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleGananciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleGananciaPageRoutingModule {}
