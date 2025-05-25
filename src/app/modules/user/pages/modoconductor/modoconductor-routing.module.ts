import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModoconductorPage } from './modoconductor.page';

const routes: Routes = [
  {
    path: '',
    component: ModoconductorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModoconductorPageRoutingModule {}
