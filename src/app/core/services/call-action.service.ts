import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import CallActionPlugin from 'src/plugins/call-action.plugin'; // ajusta ruta si cambia
import { Capacitor } from '@capacitor/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CallActionService {

  // Observable que emitirá los datos al componente
  private accionSubject = new Subject<{ accion: string, idViaje: string, idUser: string }>();
  public accion$ = this.accionSubject.asObservable(); // Observable público

  private user: any;

  constructor(private alertController: AlertController) { }

  setUser(user: any) {
    this.user = user;
  }

  /*
    initListener(user: any) {
      Capacitor.Plugins['CallActionPlugin']['addListener']('viaje:accion', async (data: any) => {
        console.log('🔔 Evento desde Android nativo:', data);
        const { accion, idViaje, idUser } = data;
  
        if (!this.user) {
          console.warn('⚠️ Usuario no definido aún en CallActionService');
          return;
        }
  
        if (accion === 'aceptar') {
          const info = {
            solicitudId: idViaje,
            conductorId: user,
          };
  
          await CallActionPlugin.limpiarAccionViaje();
          // Aquí puedes emitir un evento global, o llamar otro servicio
        } else {
          await CallActionPlugin.limpiarAccionViaje();
        }
      });
    }
    */

  initListener() {
    Capacitor.Plugins['CallActionPlugin']['addListener']('viaje:accion', async (data: any) => {
      const { accion, idViaje, idUser } = data;

      if (!this.user) {
        console.warn('⚠️ Usuario no definido aún en CallActionService');
        return;
      }
      this.accionSubject.next({ accion, idViaje, idUser });
    });
  }

}
