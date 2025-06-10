import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AlertController, MenuController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocationService } from 'src/app/core/services/location.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConductorService } from 'src/app/core/services/conductor.service';
import { WebSocketService } from 'src/app/core/services/web-socket.service';
import { Subscription } from 'rxjs';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { CalificacionComponent } from 'src/app/shared/components/calificacion/calificacion.component';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SolicitudService } from 'src/app/core/services/solicitud.service';

import { NativeAudio } from '@capacitor-community/native-audio';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { CallActionService } from 'src/app/core/services/call-action.service';
import { FcmService } from 'src/app/core/services/fcm.service';
//import CallActionPlugin from 'src/plugins/call-action.plugin';
//import { CallActionService } from 'src/app/core/services/call-action.service';
//import { FcmService } from 'src/app/core/services/fcm.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],

})
export class HomePage implements OnInit {

  solicitud: any;
  solicitudes: any;
  user: any;
  userRole: any;
  isOnline: boolean = false;
  isActive: boolean = false;
  loading: boolean = true;

  intervalo: any;
  subscription: Subscription | null = null;
  timerSubscription: Subscription | null = null;
  private solicitudSub: Subscription | undefined;

  solicitudId: number | null = null;
  solicitudIdUser: number | null = null;
  solicitudTimer: any;
  private vibracionInterval: any;
  interSoli: any;
  tiempoRestante: number = 30;  // Tiempo restante en segundos (30 segundos)
  progreso: number = 1;         // Progreso de la barra, va de 0 a 1
  colorProgreso: string = 'success';  // Color de la barra de progreso

  constructor(private onesignal: OnesignalService,
    private driverService: ConductorService,
    private socketService: WebSocketService,
    private menuController: MenuController,
    private callActionService: CallActionService,
    private fcmService: FcmService,
    private locationService: LocationService,
    private router: Router,
    private alertController: AlertController,
    private soliService: SolicitudService,
    private modalController: ModalController,
    private auth: AuthService,
    private userService: UserService) {
    this.user = this.auth.getUser();
    this.userRole = this.auth.getRole();
    if (this.user) {
      this.initFcm();

    }

    this.preloadSound();

    this.locationService.location$.subscribe(async coords => {
    })

    this.locationService.watchUserLocation();
    this.locationService.init();
  }

  async ngOnInit() {

    if (this.user) {
      /*this.callActionService.accion$.subscribe(async ({ accion, idViaje, idUser }) => {
        this.solicitudId = Number(idViaje);
        this.solicitudIdUser = Number(idUser);
        if (accion === 'aceptar') {
          this.aceptarSolicitud();
        } else {
          this.rechazarSolicitud()
        }

        // Opcional: limpiar el estado nativo
        await Capacitor.Plugins['CallActionPlugin']['limpiarAccionViaje']();
      });*/
    }



  //  this.callActionService.setUser(this.user.idUser);
  //  this.callActionService.initListener();
    this.escucharSolicitud();
    this.onesignal.initialize(this.userRole, this.user.idUser);
    this.getEstado();
    this.escucharSolicitudes();
    this.checkDocumentation();
    this.getEstadoCalificacion()
  }


  async ionViewDidEnter() {
  const accion = await Capacitor.Plugins['CallActionPlugin']['obtenerUltimaAccion']();
  if (accion && accion.accion && accion.idViaje && accion.idUser) {
    this.solicitudId = Number(accion.idViaje);
    this.solicitudIdUser = Number(accion.idUser);

    if (accion.accion === 'aceptar') {
      this.aceptarSolicitud();
    } else {
      this.rechazarSolicitud();
    }

    await Capacitor.Plugins['CallActionPlugin']['limpiarAccionViaje']();
  }

  this.callActionService.setUser(this.user.idUser);
  this.callActionService.initListener();
}



  escucharSolicitud() {
    this.socketService.listen('solicitud_iniciar_viaje', async (data: any) => {
    })
  }

  getEstado() {
    try {
      this.userService.getEstado(this.user.idUser).subscribe((re) => {
        if (re.msg == "SUCCESSFULLY") {
          var data = re.result;
          this.isOnline = data.estado;
          /* 
             this.socket.emit("registrar_conductor", this.user.idUser);
           }*/

          this.socketService.emit('cambiar_estado', {
            driverId: this.user.idUser,
            estado: this.isOnline ? 1 : 0
          });

        }
      })


    } catch (error) {
      console.error(error);
    }
  }


  getEstadoCalificacion() {
    this.interSoli = setInterval(async () => {
      await this.getNotCalificacion()
    }, 5000);
  }

  getNotCalificacion() {
    this.userService.getNoCalificacion(this.user.idUser).subscribe((response) => {
      if (response.success == true) {
        clearInterval(this.interSoli);
        var data = response.result;
        this.mostrarModalCalificacion(data[0].idUser, data[0].id);
        clearInterval(this.interSoli);
        this.interSoli = null;
      }
    })
  }

  async mostrarModalCalificacion(idDriver: any, idViaje: any) {

    const modal = await this.modalController.create({
      component: CalificacionComponent,
      componentProps: {
        emisorId: this.user.idUser, // Cambiar dinámicamente
        receptorId: idDriver, // Cambiar dinámicamente
        idViaje: idViaje,
        rol: 'conductor'
      },
      cssClass: 'small-modal',
      backdropDismiss: false // Evita que el usuario cierre el modal sin calificar
    });
    await modal.present();


    // Capturar el valor devuelto desde el modal
    const { data } = await modal.onDidDismiss();
    if (data.califico == true) {
      // this.interSoli = null;
      await this.getEstadoCalificacion()
    }
  }


  escucharSolicitudes() {
    this.socketService.listen('nueva_solicitud', async (data: any) => {
      if (data?.solicitudId) {

        this.getFotoPerfil(data.idUser);
        this.iniciarVibracion();
        this.tiempoRestante = this.calcularTiempoRestante(data.tiempoExpiracion);
        this.mostrarSolicitud();

        this.solicitud = data;
        this.solicitudIdUser = data.idUser;
        this.solicitudId = data.solicitudId;
        this.solicitud.foto = data.foto?.foto;

      }
    })

    this.socketService.listen('solicitud_cancelada', async (data: any) => {
      if (this.solicitudId === data.solicitudId) {
        this.detenerVibracion();
        this.solicitud = null; // Ocultar solicitud
        this.solicitudId = null;
        this.limpiarTemporizador();
      }
    });

    // Escuchar si la solicitud expira
    this.socketService.listen('solicitud_expirada', (data: any) => {
      if (this.solicitudId === data.solicitudId) {
        this.solicitud = null; // Ocultar solicitud
        this.solicitudId = null;
        this.limpiarTemporizador();
      }
    });
  }

  getFotoPerfil(idUser: any) {
    const response = this.userService.getFoto(idUser);
    response.subscribe((response) => {
      if (response.success) {
        var data = response.result;
        this.solicitud.foto = data.foto;

      }
    })

  }

  // Función para iniciar vibración repetitiva
  iniciarVibracion() {
    this.detenerVibracion(); // Asegurarse de que no haya otra vibración activa
    this.vibracionInterval = setInterval(async () => {
      await Haptics.impact({ style: ImpactStyle.Heavy }); // Vibración fuerte
    }, 1000); // Cada 1 segundo (puedes ajustar este tiempo)
  }

  // Función para detener la vibración
  detenerVibracion() {
    if (this.vibracionInterval) {
      clearInterval(this.vibracionInterval);
      this.vibracionInterval = null;
    }
  }

  async mostrarSolicitud() {
    // Iniciar temporizador de 30 segundos
    this.solicitudTimer = setInterval(() => {

      this.tiempoRestante--;
      this.playNotificationSound();
      //this.storageService.setItem('timeExpiration', { valor: this.tiempoRestante })
      this.progreso = this.tiempoRestante / 30; // Calcula el progreso (de 0 a 1)

      // Cambiar color de la barra de progreso a rojo si el tiempo se acerca al final
      if (this.tiempoRestante <= 5) {
        this.colorProgreso = 'danger';
      }

      // Si el tiempo se agotó, rechazamos automáticamente
      if (this.tiempoRestante <= 0) {
        //this.storage.removeItem('timeExpiration');
        this.rechazarSolicitud();
      }
    }, 1000);
  }

  limpiarTemporizador() {
    if (this.solicitudTimer) {
      clearTimeout(this.solicitudTimer);
      this.solicitudTimer = null;

      this.tiempoRestante = 30;  // Tiempo restante en segundos (30 segundos)
      this.progreso = 1;         // Progreso de la barra, va de 0 a 1
      this.colorProgreso = 'success';  // Color de la barra de progreso

    }
  }

  aceptarSolicitud() {
    if (this.solicitudId) {
      this.soliService.resumePollingOnTripEnd();
      var data = {
        solicitudId: this.solicitudId,
        conductorId: this.user.idUser
      }
      this.driverService.aceptarSolicitud(data).subscribe((re) => {
        this.tiempoRestante = 30;

        this.socketService.emit(`respuesta_solicitud`, { estado: 'Aceptado', solicitudId: this.solicitudId, conductorId: this.user.idUser, idUser: this.solicitudIdUser });
        this.detenerVibracion();
        var noti = {
          userId: null,
          sonido: 'vacio',
          title: 'Viaje Un Ray',
          message: 'Tu solicitud de viaje a sido aceptada. ',
          fecha: this.obtenerFechaHoraLocal(),
          idUser: this.solicitudIdUser
        }
        this.router.navigate(['/driver/travel-route']);
        this.onesignal.getToken(this.solicitudIdUser).subscribe((resp => {
          var data = resp.result;
          var token = data.onesignal_token;
          noti.userId = token;

          const response = this.onesignal.enviarNotificacion(noti);
          response.subscribe((resp) => {
            return 0;
          })
        }))
        return 0;
      })
    }
    this.limpiarTemporizador();
    this.solicitud = null;
  }

  rechazarSolicitud() {
    if (this.solicitudId) {
      var data = {
        id: this.user.idUser
      }
      this.tiempoRestante = 30;
      //  this.procesarSolicitud('Rechazado');
      this.updateStatus()
      const response = this.userService.updateEstadoConductorViaje(data).toPromise();
      //  this.storageService.removeItem('timeExpiration');
      this.socketService.emit(`respuesta_solicitud`, { estado: 'Rechazado', solicitudId: this.solicitudId, conductorId: this.user.idUser, idUser: this.solicitudIdUser });
      this.detenerVibracion();
      this.limpiarTemporizador();
      this.solicitud = null;
      // this.socketService.emit(`respuesta_solicitud_${this.solicitudId}`, { estado: 'Rechazado' });
    }
  }

  // Método para detener el intervalo
  detenerIntervalo(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;

    }
  }

  procesarSolicitud(accion: string) {
    const data = {
      conductorId: this.user.idUser,
      solicitudId: this.solicitud.solicitudId,
      accion: accion
    }
    const response = this.driverService.procesarSolicitud(this.user.idUser, data);
    response.subscribe((re) => {
      this.detenerIntervalo();

      this.solicitud = null;
      this.tiempoRestante = 0;
      this.loading = false;
      //  this.getObtenerSolicitud();
    })
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir
    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }


  async checkDocumentation() {

    /*  const loading = await this.loadingController.create({
        message: 'Verificando documentación...',
        spinner: 'crescent',
        duration: 10000, // Tiempo máximo antes de que se cierre el loading
      });*/

    //await loading.present();

    try {
      this.userService.getDocumentacion(this.user.idUser).subscribe((re) => {
        if (!re?.result) {
          //    this.isActive = false;
          //  this.router.navigate(['/driver/afiliacion'], { replaceUrl: true });
          this.router.navigate([`/driver/afiliacion/${this.user.idUser}`]);
        } else {
          //    this.isActive = true;
        }
      })
    } catch (error) {
      console.error('Error verificando la documentación:', error);
    } finally {
      // Cierra el loading
      // await loading.dismiss();
    }

  }


  toggleStatus() {
    this.isOnline = !this.isOnline;
    const toggle = document.querySelector('.custom-toggle');
    if (this.isOnline) {
      toggle?.classList.add('checked');
    } else {
      toggle?.classList.remove('checked');
    }
  }

  updateStatus() {
    var data = {
      id: this.user.idUser,
      estado: this.isOnline
    }

    this.isOnline = !this.isOnline;
    this.socketService.emit('cambiar_estado', {
      driverId: this.user.idUser,
      estado: this.isOnline ? 1 : 0
    });

    this.userService.updateEstadoUser(this.user.idUser, data).subscribe((re) => {
      this.getEstado();
      return 0;
    })
  }


  stopTracking() {
    // Detener el seguimiento
    this.locationService.stopTracking();
  }
  cerrar() {
    this.auth.logout();
  }

  async sendTravelRequestNotification() {
    await LocalNotifications.requestPermissions(); // Solicita permisos si no se han concedido

    const notification = await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Nueva Solicitud de Viaje',
          body: 'Tienes una nueva solicitud de viaje pendiente.',
          id: 1, // ID único para la notificación
          schedule: { at: new Date(Date.now() + 1000) }, // Tiempo de activación (1 segundo después de la llamada)
          sound: 'default',
          actionTypeId: '',
          extra: null
        }
      ]
    });


  }
  /*
    playNotificationSound() {
      const audio = new Audio('assets/sound/sound1.mp3');
      audio.load(); // Precarga el sonido para que esté listo
    }*/

  async preloadSound() {
    try {
      await NativeAudio.preload({
        assetId: 'notification',
        assetPath: 'sound1.mp3',
        audioChannelNum: 1,
        isUrl: false
      });

    } catch (error) {
      console.error('Error al cargar el sonido:', error);
    }
  }

  async playNotificationSound() {
    try {
      await NativeAudio.play({ assetId: 'notification' });

    } catch (error) {
      console.error('Error al reproducir el sonido:', error);
    }
  }


  calcularTiempoRestante(tiempoExpiracion: any) {
    const ahora = Date.now(); // Obtener la hora actual
    const tiempoRestante = tiempoExpiracion - ahora; // Calcular el tiempo restante en milisegundos

    if (tiempoRestante > 0) {
      return Math.floor(tiempoRestante / 1000); // Convertir a segundos
    } else {
      return 0; // Ya expiró
    }
  }
  obtenerFechaHoraLocal(): string {
    const now = new Date();
    return now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");
  }

  notification() {
    this.router.navigate(['/driver/notificaciones']);
  }

  async initFcm() {
    const user = this.user.idUser;
    if (user) {
      await this.fcmService.requestFcmPermissionAndGetToken(user);
    }
  } 

  ngOnDestroy(): void {
    this.limpiarTemporizador();
  }

}
