import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AfiliacionPage } from './afiliacion.page';

const routes: Routes = [
  {
    path: '',
    component: AfiliacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliacionPageRoutingModule {}
