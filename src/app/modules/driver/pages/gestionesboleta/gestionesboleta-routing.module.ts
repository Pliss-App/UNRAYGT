import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionesboletaPage } from './gestionesboleta.page';

const routes: Routes = [
  {
    path: '',
    component: GestionesboletaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionesboletaPageRoutingModule {}
