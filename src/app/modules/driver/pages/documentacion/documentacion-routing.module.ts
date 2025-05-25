import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentacionPage } from './documentacion.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentacionPageRoutingModule {}
