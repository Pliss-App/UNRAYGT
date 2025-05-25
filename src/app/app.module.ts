import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { LocationService } from './core/services/location.service';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx'; 
import { environment } from 'src/environments/environment';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

const config: SocketIoConfig = {
  url: 'http://localhost:3000', // Asegúrate de poner la URL correcta de tu backend
  options: {},
};

@NgModule({
  declarations: [AppComponent],
  imports: [ BrowserModule, IonicModule.forRoot(),  SocketIoModule.forRoot(config), AppRoutingModule, HttpClientModule,    SharedModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy, }, LaunchNavigator,/*BackgroundMode , LaunchNavigator,  CallNumber ,*/ /*OneSignal,*/LocationService, Diagnostic, SocialSharing],
  bootstrap: [AppComponent],
})
export class AppModule {}
