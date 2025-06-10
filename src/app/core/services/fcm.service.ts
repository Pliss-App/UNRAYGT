import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
//import { FirebaseMessaging } from '@capacitor-firebase/messaging';
//import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

   constructor(private userService: UserService) {}

  async requestFcmPermissionAndGetToken(user: any): Promise<void> {
    
    try {
      const { receive } = await FirebaseMessaging.requestPermissions();

      if (receive === 'granted' && Capacitor.getPlatform() !== 'web') {
        const { token } = await FirebaseMessaging.getToken();

        if (token) {
          const data = {
            id: user,
            token: token
          };
          await this.userService.updateTokenFcm(data).toPromise();
        }
      } else {
        console.warn('🔒 Permiso para notificaciones no concedido o plataforma no compatible.');
      }
    } catch (error) {
      console.error('❌ Error al obtener o guardar el token FCM:', error);
    }
      
  }
}
