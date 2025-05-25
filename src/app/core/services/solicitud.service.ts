import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { UserService } from './user.service';
import { Socket } from 'socket.io-client';
import { WebSocketService } from './web-socket.service';
import { BehaviorSubject, catchError, interval, of, Subject, Subscription, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SharedService } from './shared.service';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  socket: Socket | undefined;
  private pollingInterval = 1000; // 5 segundos
  solicitud: any;
  private tripStatus$ = new BehaviorSubject<boolean>(false);
  private pollingSubscription: Subscription | null = null;
  user: any;
  role: any = null;
  conductoresDisponibles = [
    { id: 'conductor1', nombre: 'Juan' },
    { id: 'conductor2', nombre: 'Luis' },
    { id: 'conductor3', nombre: 'Pedro' },
    // Más conductores cercanos
  ];


  private solicitudRespuestaSubject = new Subject<any>();
  public solicitudRespuesta$ = this.solicitudRespuestaSubject.asObservable();

  constructor(private route: ActivatedRoute, private location: Location, private sharedService: SharedService,
    private api: UserService, private socketService: WebSocketService,
    private auth: AuthService, private router: Router
  ) {

    this.role = this.auth.getRole();
  }

  // Inicia la consulta al endpoint
  startPolling() {
    this.user = this.auth.getUser();
    const userRole = this.auth.getRole();
    // console.log("DATOS DEL USUARIO ", this.user)
    if (!this.user) {
      console.error('Usuario no autenticado.');
      return;
    }

    this.getSolicitud();
    if (this.pollingSubscription) {
      return; // Ya está activo el polling
    }

    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        switchMap(() => {
          const timestamp = new Date().getTime(); // Generar un timestamp único
          //    console.log('Consultando endpoint...');
          return this.api.checkActiveTravel(this.user.idUser, timestamp);
        }),
        catchError((error) => {
          console.error('Error en la consulta al endpoint:', error);
          return of(null); // Evitar que el flujo se interrumpa
        })
      )
      .subscribe((response) => {
        //    console.log('Respuesta recibida:', response);
        if (response?.success) {
          //   console.log('Viaje activo detectado');
          this.tripStatus$.next(true);
          this.navigateToActiveTrip(userRole);
          //   this.stopPolling();
        } else {

          var url: any = this.router.url;
          if (url == "/user/travel-route" || url == "/driver/travel-route") {
            this.resumePollingOnTripEnd();
          }


        }
      });
  }

  getSolicitud() {
    const userRole = this.auth.getRole();
    const timestamp = new Date().getTime();
    this.api.checkActiveTravel(this.user.idUser, timestamp).subscribe((response) => {
      if (response?.success) {
        this.sharedService.datViaPre(response)
        // this.solicitud = response.result;
        this.navigateToActiveTrip(userRole);
      }
    });
  }
  // Detiene la consulta al endpoint
  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  // Navega a la vista del viaje activo
  navigateToActiveTrip(userRole: any) {
    if (userRole === 'usuario') {
      this.router.navigate(['/user/travel-route']); // Ajusta la ruta según tu aplicación
    } else {
      this.router.navigate(['/driver/travel-route']); // Ajusta la ruta según tu aplicación
    }
  }


  // Reanuda el polling al finalizar el viaje
  resumePollingOnTripEnd() {
    this.startPolling();
    this.tripStatus$.next(false);
    const userRole = this.auth.getRole();
    if (userRole === 'usuario') {
      this.router.navigate(['/user/home'], { replaceUrl: true }).then(() => {
        this.location.go('/user/home');
        window.location.reload();
      });
    } else {
      this.router.navigate(['/driver/home'], { replaceUrl: true }).then(() => {
        this.location.go('/driver/home');
        //    window.location.reload();
      });
    }

  }


  enviarRespuesta(respuesta: any) {
    this.sharedService.activeMenuLat(false);
    this.solicitudRespuestaSubject.next(respuesta);
  }

  // Función para enviar la solicitud al conductor
  async enviarSolicitudAConductor(
    solicitud: any,
    actualizarEstado: (estado: string) => void,
    onSolicitudAceptada: (conductorId: string) => void
  ) {
    const response = this.api.enviarSolicitud(solicitud);

    response.subscribe((re) => {
      this.enviarRespuesta(re);

    })
  }


}
