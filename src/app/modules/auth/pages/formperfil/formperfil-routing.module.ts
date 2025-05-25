import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormperfilPage } from './formperfil.page';

const routes: Routes = [
  {
    path: '',
    component: FormperfilPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormperfilPageRoutingModule {}
