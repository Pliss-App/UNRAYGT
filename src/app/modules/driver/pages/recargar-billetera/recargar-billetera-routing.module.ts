import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecargarBilleteraPage } from './recargar-billetera.page';

const routes: Routes = [
  {
    path: '',
    component: RecargarBilleteraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecargarBilleteraPageRoutingModule {}
