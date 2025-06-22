import { Injectable } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
//import { OneSignal } from 'onesignal-ngx';
//import { OneSignal } from '@ionic-native/onesignal/ngx';
import OneSignal from 'onesignal-cordova-plugin';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { auth } from './firebase';
import { AuthService } from './auth.service';
//import { OneSignal, OSNotificationPayload } from '@ionic-native/onesignal/ngx'; 
@Injectable({
  providedIn: 'root'
})
export class OnesignalService {

  private appId = '9e1814a7-d611-4c13-b6e4-fa16fafc21e3'; // Reemplaza con tu OneSignal App ID
  private googleProjectNumber = '524176191412'; // Solo si usas FCM

  constructor(private api: UserService,
    private platform: Platform,
    private apiService: ApiService,
    private auth: AuthService,
    private navCtrl: NavController) {


  }

  async initialize(item: any, id: any) {

    await this.platform.ready(); // Espera a que la plataforma esté lista

    if (this.platform.is('capacitor')) {
      try {
        OneSignal.initialize(this.appId);

        // 🛑 Verifica si los permisos de notificación ya fueron concedidos
        const permission = await OneSignal.Notifications.hasPermission();

        if (!permission) {
          await OneSignal.Notifications.requestPermission(true);
        }

        const subscription = await OneSignal.User.pushSubscription.getIdAsync();
        var data = {
          id: id,
          token: subscription
        }

        const rsult = this.api.updateTokenOneSignal(data);
        rsult.subscribe((re) => {
          return;
        })

        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event: any) => {
          this.playNotificationSound();
          event.preventDefault();
          event.notification.display();
        });

        OneSignal.Notifications.addEventListener("click", async (event: any) => {
          const data = event.notification.additionalData;
          const role = this.auth.getRole();

          // Espera un tiempo mínimo para asegurar que Ionic cargó
          setTimeout(() => {
            if (data && data.tipo === 'bloqueo') {
              this.navCtrl.navigateRoot('/driver/billetera');
            } else if (data && data.tipo === 'viaje') {
              if (role === 'usuario') {
                this.navCtrl.navigateForward('/user/travel-route');
              } else {
                this.navCtrl.navigateForward('/driver/travel-route');
              }
            } else {
              if (role === 'usuario') {
                this.navCtrl.navigateRoot('/user');
              } else {
                this.navCtrl.navigateRoot('/driver');
              }
            }
          }, 500); // Espera breve para garantizar que las vistas estén listas
        });
      } catch (error) {
        console.error('Error inicializando OneSignal:', error);
      }
    } else {
      console.warn('OneSignal no está disponible en Web');
    }
  }
  // Función para reproducir un sonido
  playNotificationSound() {
    const audio = new Audio('assets/sound/notificacion_tono.mp3');
    audio.play();
  }

  enviarNotificacion(data: any) {
    return this.apiService.post('viaje/send-notification', data);
  }


  getToken(id: any) {
    return this.apiService.get(`viaje/get-token/${id}`);
  }


  async requestNotificationPermission() {
    const status = await OneSignal.Notifications.requestPermission(true);

    console.log("Estado del permiso:", status);
  }




}
