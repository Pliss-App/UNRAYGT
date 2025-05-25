import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormtelefonoPage } from './formtelefono.page';

const routes: Routes = [
  {
    path: '',
    component: FormtelefonoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormtelefonoPageRoutingModule {}
