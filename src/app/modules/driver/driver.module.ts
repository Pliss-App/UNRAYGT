import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { DriverRoutingModule } from './driver-routing.module';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';


@NgModule({
  declarations: [],
  imports: [
    CommonModule, 
    IonicModule,
    DriverRoutingModule,
    SharedModule 
  ],
  providers: [
    InAppBrowser, // Registrar aquí
  ],
})
export class DriverModule { }
