import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import CallActionPlugin from 'src/plugins/call-action.plugin'; // ajusta ruta si cambia
import { Capacitor } from '@capacitor/core';
import { catchError, map, Observable, of, Subject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CallActionService {
  private listenerActivo = false;
  // Observable que emitirá los datos al componente
  private accionSubject = new Subject<{ accion: string, idViaje: string, idUser: string, idConductor:string }>();
  public accion$ = this.accionSubject.asObservable(); // Observable público

  private user: any;

  constructor(private alertController: AlertController, private api: UserService) { }

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

      if (this.listenerActivo) return; // evita múltiples registros
  this.listenerActivo = true;

    Capacitor.Plugins['CallActionPlugin']['addListener']('viaje:accion', async (data: any) => {
    const { accion, idViaje, idUser, idConductor } = data;
    this.accionSubject.next({ accion, idViaje: idViaje, idUser: idUser, idConductor: idConductor});

    // Limpiar estado guardado (opcional aquí si también lo haces en la carga inicial)
    await Capacitor.Plugins['CallActionPlugin']['limpiarAccionViaje']();
  });

 Capacitor.Plugins['CallActionPlugin']['getAccionViaje']().then(async (data: any) => {
    const { accion, idViaje, idUser, idConductor } = data;
    if (accion && idViaje && idUser && idConductor) {
      this.accionSubject.next({ accion, idViaje: idViaje, idUser: idUser, idConductor: idConductor });

      // Limpiar para evitar duplicados si el usuario vuelve a abrir la app
      await Capacitor.Plugins['CallActionPlugin']['limpiarAccionViaje']();
    }
  }).catch((err:any) => {
    console.error('Error al obtener acción almacenada:', err);
  });
  }

getNotificacionesNoLeidas(idUser:any): Observable<number> {


  return this.api.getNotificacionesUserNoLeidas(idUser).pipe(
    map(re => {
      if (re.success && re.result) {
        var data = re.result;
        // asumiendo que `re.data` es un array de notificaciones
        return data[0].total;
      } else {
        return 0;
      }
    }),
    catchError(err => {
      console.error('Error al obtener notificaciones', err);
      return of(0); // en caso de error, devolver 0
    })
  );
}


}
