import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionlocationPage } from './permissionlocation.page';

const routes: Routes = [
  {
    path: '',
    component: PermissionlocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermissionlocationPageRoutingModule {}
