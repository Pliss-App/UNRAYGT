import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SolicitudService } from 'src/app/core/services/solicitud.service';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { LocationService } from 'src/app/core/services/location.service';
import { WebSocketService } from 'src/app/core/services/web-socket.service';
import { CalificacionComponent } from 'src/app/shared/components/calificacion/calificacion.component';
import { UserService } from 'src/app/core/services/user.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor, Plugins } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
const { FcmToken } = Plugins as any; // Reemplaza 'MyFCMPlugin' con el nombre de tu plugin

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userRole: any;
  message: string = '';
  user: any = null;
  interSoli: any = null;
  idViaje: any = null;
  isActiveMenu: boolean = false;

  constructor( private onesignal: OnesignalService, private alertController: AlertController,
    private sharedDataService: SharedService, private soli: SolicitudService, private socketService: WebSocketService,
    private router: Router, private location: LocationService,
    private auth: AuthService, private userService: UserService, private modalController: ModalController, private menuController: MenuController) {
    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
    this.sharedDataService.menu.subscribe((re) => {
      this.isActiveMenu = re;
    });
    this.requestFcmPermissionAndGetToken()
    this.onesignal.initialize(this.userRole, this.user.idUser);
  }

  async ngOnInit() {
     this.location.watchUserLocation();
    this.getSolicitudCreada();
    //this.soli.startPolling();
    this.escucharSolicitud();
    this.getCalificar();

    await this.getEstadoCalificacion();


  }

  getSolicitudCreada() {
    this.socketService.listen('solicitud_creada', async (data: any) => {
      if (data.estado == true) {
        this.idViaje = data.solicitudId;
      }
    })
  }

  getEstadoCalificacion() {
    this.interSoli = setInterval(async () => {
      await this.getNotCalificacion()
    }, 1500);
  }

  getCalificar() {
    this.socketService.listen('calificar', async (data: any) => {
      if (data.estado == true) {
        this.mostrarModalCalificacion(data.idUser, data.idViaje);
      }

    })
  }

  getNotCalificacion() {
    this.userService.getNoCalificacion(this.user.idUser).subscribe((response) => {
      if (response.success == true) {
        var data = response.result;
        this.mostrarModalCalificacion(data[0].idConductor, data[0].id);
        clearInterval(this.interSoli);
        this.interSoli = null;
      }
    })
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir
    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  escucharSolicitud() {
    this.socketService.listen('solicitud_iniciar', async (data: any) => {
      this.router.navigate(['/user/travel-route']); // Ajusta la ruta según tu aplicación
    })
  }

  goToProfile() {
    this.router.navigate(['/user/profile']); // Navegar a la página de perfil
  }

  sendMessage() {
    // Este método puede actualizar `message` para enviar nuevo valor a `app-child`
    this.message = this.message + '!';
  }

  async locate() {
    const coordinates = await Geolocation.getCurrentPosition();
    const coords = {
      lat: coordinates.coords.latitude, lon: coordinates.coords.longitude,
      heading: coordinates.coords.heading
    };

    const data = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude, direction: 'salida', address: '' };

    //   this.showAlert('📍 Ubicación obtenida', `Lat: ${coords.lat}, Lng: ${coords.lon}`);
    this.sharedDataService.setData(data);

  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async mostrarModalCalificacion(idDriver: any, idViaje: any) {

    const modal = await this.modalController.create({
      component: CalificacionComponent,
      componentProps: {
        emisorId: this.user.idUser, // Cambiar dinámicamente
        receptorId: idDriver, // Cambiar dinámicamente
        idViaje: idViaje,
        rol: 'user'
      },
      cssClass: 'small-modal',
      backdropDismiss: false // Evita que el usuario cierre el modal sin calificar
    });
    await modal.present();


    // Capturar el valor devuelto desde el modal
    const { data } = await modal.onDidDismiss();
    if (data.califico == true) {
      await this.getEstadoCalificacion()
    }
  }

  cerrar() {
    this.auth.logout();
  }

  cancelarViaje() {
    this.socketService.emit(`respuesta_solicitud`, { estado: 'Cancelado', solicitudId: this.idViaje, conductorId: this.user.idUser, idUser: this.user.idUser });
  }

  notification() {
    this.router.navigate(['/user/notificaciones']);
  }


  async requestFcmPermissionAndGetToken() {
    // Solicita permiso para notificaciones (solo necesario en iOS)
    const { receive } = await FirebaseMessaging.requestPermissions();
    if (receive === 'granted') {

      if (Capacitor.getPlatform() !== 'web') {
        const { token } = await FirebaseMessaging.getToken();
        const data = {
          id: this.user.idUser,
          token: token
        }
        const response = await this.userService.updateTokenFcm(data).toPromise();
      } else {
        console.warn('🔒 Permiso para notificaciones no concedido.');
      }
    }
  }
}
