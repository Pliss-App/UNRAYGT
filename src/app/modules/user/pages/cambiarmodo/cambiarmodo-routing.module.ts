import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CambiarmodoPage } from './cambiarmodo.page';

const routes: Routes = [
  {
    path: '',
    component: CambiarmodoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CambiarmodoPageRoutingModule {}
