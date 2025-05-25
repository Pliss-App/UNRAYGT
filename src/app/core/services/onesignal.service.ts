import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
//import { OneSignal } from 'onesignal-ngx';
//import { OneSignal } from '@ionic-native/onesignal/ngx';
import OneSignal from 'onesignal-cordova-plugin';

import { UserService } from './user.service';
import { ApiService } from './api.service';
//import { OneSignal, OSNotificationPayload } from '@ionic-native/onesignal/ngx'; 
@Injectable({
  providedIn: 'root'
})
export class OnesignalService {

  private appId = '9e1814a7-d611-4c13-b6e4-fa16fafc21e3'; // Reemplaza con tu OneSignal App ID
  private googleProjectNumber = '524176191412'; // Solo si usas FCM

  constructor(private api: UserService, private platform: Platform, private apiService: ApiService/*, private oneSignal:  OneSignal*/) {
    // this.initialize();
 
  }

  async initialize(item: any, id: any) {

    await this.platform.ready(); // Espera a que la plataforma esté lista

    if (this.platform.is('capacitor')) {
      try {
        OneSignal.initialize(this.appId);

           // 🛑 Verifica si los permisos de notificación ya fueron concedidos
           const permission = await OneSignal.Notifications.hasPermission();
           console.log("📢 Permisos de notificación:", permission);
   
           if (!permission) {
             console.log("⚠️ El usuario no ha concedido permisos. Solicitándolos...");
             await OneSignal.Notifications.requestPermission(true);
           }
   

        const subscription = await OneSignal.User.pushSubscription.getIdAsync();
        var data = {
          id: id,
          token: subscription
        }

        const rsult = this.api.updateTokenOneSignal(data);
        rsult.subscribe((re)=>
        {
          return;
        })

       // OneSignal.User.addTag(`notif-${item}`, "true");

        // Manejar la recepción de notificaciones
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event: any) => {
          console.log("Notificación recibida en primer plano:", event);
          this.playNotificationSound();
          event.preventDefault();

          event.notification.display();
       
        });

        // Manejar cuando se abre una notificación
        OneSignal.Notifications.addEventListener("click", (event) => {
          console.log("Notificación abierta:", event);
          // Aquí puedes redirigir a una página específica
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
