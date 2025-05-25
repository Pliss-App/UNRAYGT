import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormnombresPage } from './formnombres.page';

const routes: Routes = [
  {
    path: '',
    component: FormnombresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormnombresPageRoutingModule {}
