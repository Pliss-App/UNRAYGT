import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-permissionlocation',
  templateUrl: './permissionlocation.page.html',
  styleUrls: ['./permissionlocation.page.scss'],
})
export class PermissionlocationPage implements OnInit {

  constructor(private diagnostic: Diagnostic, private platform: Platform, private alertController: AlertController) { }

  ngOnInit() {

    this.platform.ready().then(async () => {
      this.checkLocationServices();
    })
  }


  checkLocationServices() {
    this.diagnostic.isLocationEnabled().then(
      async (enabled) => {
        if (enabled) {
          console.log('✅ Ubicación del sistema ACTIVADA');
        } else {
          console.log('❌ Ubicación del sistema DESACTIVADA');
          await this.presentAlertLocationDisabled();
        }
      },
      (error) => {
        console.error('Error verificando ubicación:', error);
      }
    );
  }

  async requestLocationPermission() {

    const status = await Geolocation.checkPermissions();

    if (status.location === 'granted') {
      console.log('Permiso ya concedido');
      window.location.reload();
      return;
    }

    try {
      const permission = await Geolocation.requestPermissions({ permissions: ['location'] });

      if (permission.location === 'granted' || permission.location === 'prompt-with-rationale') {
        // Permiso concedido o se mostró el diálogo
        window.location.reload(); // o navega a otra página si prefieres
      } else {
        console.error('Permiso denegado:', permission.location);
      }
    } catch (error) {
      console.error('Error solicitando permiso:', error);
    }
  }

  async presentAlertLocationDisabled() {
    const alert = await this.alertController.create({
      header: 'Ubicación desactivada',
      message: 'Para continuar, por favor activa la ubicación del sistema en tu dispositivo.',
      buttons: [
        {
          text: 'Abrir ajustes',
          handler: () => {
            this.diagnostic.switchToLocationSettings();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]

    });

    await alert.present();
  }

}
