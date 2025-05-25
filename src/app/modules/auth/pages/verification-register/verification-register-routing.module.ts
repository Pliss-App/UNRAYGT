import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificationRegisterPage } from './verification-register.page';

const routes: Routes = [
  {
    path: '',
    component: VerificationRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificationRegisterPageRoutingModule {}
