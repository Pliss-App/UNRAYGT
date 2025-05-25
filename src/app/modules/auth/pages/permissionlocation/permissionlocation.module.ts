import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermissionlocationPageRoutingModule } from './permissionlocation-routing.module';

import { PermissionlocationPage } from './permissionlocation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermissionlocationPageRoutingModule
  ],
  declarations: [PermissionlocationPage]
})
export class PermissionlocationPageModule {}
