import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
//import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  //private socket: Socket;
  user: any;


  private socket = io(environment.socketUrl, {
    path: '/api/socket/',
    transports: ['websocket'], // Asegurar que coincide con el backend,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
  });

  constructor(private api: UserService, private auth: AuthService) {
    this.user = this.auth.getUser();

    if (this.auth.isAuthenticated()) {
      this.socket.on('connect', () => {
        if (this.auth.getRole() == 'conductor') {
      
            this.socket.emit("registrar_conductor", this.user.idUser);
          
        } else {
          this.socket.emit('registrar_usuario', this.user.idUser);
        }
      });
      /*
          this.socket.on('disconnect', () => {
            console.log('Desconectado del servidor');
          }); */

    }
  }


  // Escuchar eventos del servidor
  listen(eventName: string, callback: (data: any) => void) {
    this.socket.on(eventName, callback);
  }
  // Función para emitir eventos
  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  /*onNuevaSolicitud(callback: (...args: any[]) => void) {
    this.socket.on('nuevaSolicitud', callback);
  }*/

  onNuevaSolicitud(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('nueva_solicitud', (data) => {
        observer.next(data);
      });

      return () => this.socket.off('nueva_solicitud');
    });

  }


}
