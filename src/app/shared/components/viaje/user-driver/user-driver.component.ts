import { Component, Input, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { CallNumber } from 'capacitor-call-number';
import { ActionSheetController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ChatPage } from 'src/app/modules/user/pages/chat/chat.page';
import { SharedService } from 'src/app/core/services/shared.service';
import { HttpClient } from '@angular/common/http';
import { async } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { AlertController } from '@ionic/angular';
//import { Vibration } from 'cordova-plugin-vibration';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { CalificacionComponent } from '../../calificacion/calificacion.component';
import { WebSocketService } from 'src/app/core/services/web-socket.service';

import { Browser } from '@capacitor/browser';
import { StorageService } from 'src/app/core/services/storage.service';
import { ConductorService } from 'src/app/core/services/conductor.service';
declare var navigator: any;

@Component({
  selector: 'app-user-driver',
  templateUrl: './user-driver.component.html',
  styleUrls: ['./user-driver.component.scss'],
})
export class UserDriverComponent implements OnInit {
  @Input() idUser: string | null = null;

  @Input() rol: string | null = null;
  @Input() idConductor: string | null = null;
  @Input() idViaje: string | null = null;
  @Input() pointA: string | null = null;
  @Input() origin!: { lat: number; lng: number }; // Coordenadas de salida
  @Input() destination!: { lat: number; lng: number }; // Coordenadas de destino
  @Input() pointB: string | null = null;
  @Input() coste: string | null = null;
  @Input() estado_viaje: string | null = null;
  selectedPaymentMethod: string = 'efectivo'; // Efectivo seleccionado por defecto
  vibrando: boolean = false; // Controla si está vibrando
  idTokenOne: any;
  intervalId: any;
  intervalIdChat: any;
  vibracionInterval: any;
  profile: any = {};
  isChat: boolean = false;
  tiempo: any = undefined;
  distancia: any = undefined;
  user: any;
  btnLlegue: boolean = true;
  activeAlerta: boolean = false;
  isPopupOpen: boolean = false;
  options = [];
  mensajeNavegacion: any = ''
  updateStatus: any = '';
  loading: any;
  callPolicia: any = '';
  callBomberos: any = '';
  callCruzRoja: any = '';
  soliCancelar: any = "";
  // URL del placeholder
  placeholderImage: string = 'assets/img/profile.jpg';
  constructor(private http: HttpClient, private actionSheetController: ActionSheetController,
    private shared: SharedService, private alertController: AlertController,
    private apiCon: ConductorService,
    private modalController: ModalController, private platform: Platform,
    private onesignal: OnesignalService, private socketService: WebSocketService,
    private api: UserService, private auth: AuthService, private storageService: StorageService,
    private route: Router, private launchNavigator: LaunchNavigator) {
    this.user = this.auth.getUser();

    this.intervalIdChat = setInterval(() => this.getChatsNoLeido(), 15000);
  }

  ngOnInit() {
    this.loading = true;
    this.getUpdateEstado();
    this.getPerfilUsuario();
    this.getAlertaLlego();
    this.getToken();
    // this.getCalificar();
    this.shared.time.subscribe(param => {
      this.tiempo = param?.tiempo;
      this.distancia = param?.distancia;
    });
    this.verificarEstadoViaje();
    this.getMotivosCancelacion();

  }

  getUpdateEstado() {
    let time = setInterval(() => {
      this.estado_viaje = this.estado_viaje;
      //   console.log("Estado #", this.estado_viaje)
      if (this.estado_viaje == 'Pendiente de Iniciar') {
        this.updateStatus = 'En Ruta a Pasajero';
        this.mensajeNavegacion = 'Navegar a ' + this.profile.nombre
      } else {
        if (this.estado_viaje == 'En Ruta a Pasajero') {
          this.updateStatus = 'En Ruta a Pasajero';
          this.mensajeNavegacion = 'Seguir navegando';
          this.btnLlegue = false;
        } else if (this.estado_viaje == 'Conductor Llego a Salida' || this.estado_viaje == 'Usuario Va en Camino') {
          this.updateStatus = 'En Ruta a Destino';
          this.mensajeNavegacion = 'Navegar a Destino'
        } else if (this.estado_viaje == 'En Ruta a Destino') {
          this.updateStatus = 'En Ruta a Destino';
          this.mensajeNavegacion = 'Seguir navegando';
        }
      }
    }, 1000);
  }

  getAlertaLlego() {
    this.socketService.listen('alerta_llegada', async (data: any) => {
      if (!data) {
        console.log("...")
      } else {
        if (data.estado == 'Conductor Llego a Salida') {
          this.estado_viaje = data.estado
        }
      }
      //console.log("LLEGO LA ALERTA DEL CONDUCTOR AL USUARIO ", data)
    })
  }

  getCalificar() {
    this.socketService.listen('calificar', async (data: any) => {
      if (data.estado == true) {
        this.mostrarModalCalificacion();
      }
    })
  }

  getMotivosCancelacion() {
    try {
      this.soliCancelar = this.user.rol;
      const response = this.api.getCancelacionRoute(this.soliCancelar);
      response.subscribe((resp) => {
        this.options = resp.result;
      })
    } catch (error) {
      console.log(error)
    }

  }

  async getToken() {
    this.onesignal.getToken(this.idConductor).subscribe((resp => {
      var data = resp.result;
      var token = data.onesignal_token;
      this.idTokenOne = token;

    }))
  }

  async getPerfilUsuario() {
    this.profile.foto = this.placeholderImage;
    if (this.rol == 'conductor') {
      if (this.idConductor != null) {
        await this.api.getDriverProfile(this.idConductor).subscribe((re) => {
          if (re.success) {
            this.profile = re?.result;
            this.getChatsNoLeido();
            this.loading = false;
            if (!this.profile.foto) {
              this.profile.foto = this.placeholderImage;
            }
          }
        })
      }

    } else {
      if (this.idConductor != null) {
        await this.api.getUserProfileDriver(this.idConductor).subscribe((re) => {
          if (re.success) {
            this.profile = re?.result;
            this.getChatsNoLeido();
            this.loading = false;
            if (!this.profile.foto) {
              this.profile.foto = this.placeholderImage;
            }
          }
        })
      }

    }

  }

  updateEstadoViaje(item: any, idUser: any, idSoli: any) {
    try {
      var data = {
        id: this.idViaje,
        estado: item,
        idUser: idUser,
        solicitudId: idSoli
      }
      this.api.updateEstadoViaje({ data }).subscribe((resp) => {

        var data = {
          userId: this.idTokenOne,
          sonido: 'vacio',
          title: 'Viaje - Conductor',
          message: item == 'En Ruta a Usuario' ? 'El viaje se ha iniciado, esperemos todo salga bien.' : 'Ya esta tu Driver Ray esperandote. No tardes.',
          fecha: this.obtenerFechaHoraLocal(),
          idUser: this.idConductor,
          tipo: 'viaje'
        }
        this.onesignal.enviarNotificacion(data).subscribe((re) => {
          return 0;
        });

        return 0;
      })
    } catch (error) {
      console.error(error)
    }

  }


  async makeCall(phoneNumber: string) {

    try {
      // Intentar realizar la llamada directamente
      await CallNumber.call({ number: phoneNumber, bypassAppChooser: false });
    } catch (error) {
      console.error('Error al realizar la llamada', error);
    }

  }

  async openChatModal() {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        idViaje: this.idViaje,
        emisorId: this.idUser, // Cambiar dinámicamente
        receptorId: this.idConductor, // Cambiar dinámicamente
      },
    });
    await modal.present();
  }

  iniciarViaje(estado: any, idConductor: any, idViaje: any) {

    this.updateEstadoViaje(estado, idConductor, idViaje);
    this.openGoogleMapsWithCoordinates();
  }

  openGoogleMapsWithCoordinates() {
    var destination: any;
    if (this.estado_viaje == 'Pendiente de Iniciar' || this.estado_viaje == 'En Ruta a Pasajero') {
      var data = {
        userId: this.idTokenOne,
        sonido: 'vacio',
        title: 'Viaje - Iniciado',
        message: `${this.profile.nombre},  tu driver va en camino.`,
        fecha: this.obtenerFechaHoraLocal(),
        idUser: this.idConductor,
        tipo: 'viaje'
      }
      this.onesignal.enviarNotificacion(data).subscribe((re) => {
        return 0;
      });
      destination = `${this.origin.lat}, ${this.origin.lng}`;
    }

    if (this.estado_viaje == 'Conductor Llego a Salida' || this.estado_viaje == 'En Ruta a Destino' || this.estado_viaje == 'Usuario Va en Camino') {
      destination = `${this.destination.lat}, ${this.destination.lng}`;
      var noti = {
        userId: this.idTokenOne,
        sonido: 'vacio',
        title: 'Viaje - A Destino',
        message: `Esperamos que todo vaya bien en tu viaje.`,
        fecha: this.obtenerFechaHoraLocal(),
        idUser: this.idConductor,
        tipo: 'viaje'
      }
      this.onesignal.enviarNotificacion(noti).subscribe((re) => {
      });
    }

    const options: LaunchNavigatorOptions = {
      app: this.launchNavigator.APP.USER_SELECT // Cambia a TOMTOM, APPLE_MAPS, etc.
    };

    this.launchNavigator.navigate(destination, options)
      .then(success => console.log("Navegación iniciada"))
      .catch(error => alert(error));
  }

  activeBtnLlegue() {
    if (this.estado_viaje == 'En Ruta a Pasajero') {
      this.btnLlegue = false;
    } else {
      this.btnLlegue = true;
    }
    return 0;
  }

  openPopup(item: any) {
    this.soliCancelar = item;
    this.isPopupOpen = true;
    // this.shared.actionPopUp(true);//
  }

  handleClose() {
    this.isPopupOpen = false;
  }

  handleSave(selectedOption: any) {
    try {
      if (this.esValido(selectedOption)) {
        let data = {
          id: this.idViaje,
          option: 0,
          comentario: selectedOption
        }
        this.api.cancelarSolicitud(data).subscribe((resp) => {
          if (resp) {
            var data = {
              userId: this.idTokenOne,
              sonido: 'vacio',
              title: 'Viaje - Cancelado',
              message: `${this.profile.nombre}, acaba de cancelar tu viaje.`,
              fecha: this.obtenerFechaHoraLocal(),
              idUser: this.idConductor,
              tipo: 'principal'
            }
            this.onesignal.enviarNotificacion(data).subscribe((re) => {
              var val = re;
            });
          }
        })
      }
      else {
        let data = {
          id: this.idViaje,
          option: selectedOption,
          comentario: ""
        }
        this.api.cancelarSolicitud(data).subscribe((resp) => {
          if (resp) {
            var data = {
              userId: this.idTokenOne,
              sonido: 'vacio',
              title: 'Viaje - Cancelado',
              message: `${this.profile.nombre}, acaba de cancelar la solicitud.`,
              fecha: this.obtenerFechaHoraLocal(),
              idUser: this.idConductor,
              tipo: 'viaje'
            }
            this.onesignal.enviarNotificacion(data).subscribe((re) => {
              var val = re;
            });
          }
        })
      }
    } catch (error) {

    }
  }


  esValido(selectedOption: any): boolean {
    return selectedOption && selectedOption.length > 2;
  }
  async finalizar() {
    const alert = await this.alertController.create({
      header: 'Finalizar Viaje',
      message: '¿Estás seguro de que deseas finalizar el viaje?',
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      cssClass: 'custom-alert',

      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button',
          handler: () => {
            console.log('Cancelación del viaje cancelada');
          }
        },
        {
          text: 'Finalizar',
          cssClass: 'finish-button',
          handler: () => {
            // Llamada al servicio para finalizar el viaje
            var data = {
              idViaje: this.idViaje,
              idUser: this.user.idUser,
              idUserViaje: this.idConductor,
              idDriver: this.user.idUser,
              costo: this.coste,
              fecha: this.getCurrentDate(),
              hora: this.getCurrentTime()
            }
            this.api.finalizarViaje(data).subscribe(
              (resp) => {
                this.storageService.removeItem('sms-definido')
                var data = {
                  userId: this.idTokenOne,
                  sonido: 'vacio',
                  title: 'Viaje - Finalizado',
                  message: `Viaje a sido finalizado. Esperamos que todo haya ido bien.`,
                  fecha: this.obtenerFechaHoraLocal(),
                  idUser: this.idConductor,
                  tipo: 'principal'
                }
                this.onesignal.enviarNotificacion(data).subscribe((re) => {
                  var val = re;
                });
                window.location.reload();
                //this.mostrarModalCalificacion();
              },
              (error) => {
                console.error("Error al finalizar el viaje", error);
              }
            );
          }
        }
      ]
    });
    await alert.present();
  }

  verificarEstadoViaje() {
    this.intervalId = setInterval(() => {
      if (this.estado_viaje === 'Conductor Llego a Salida' && this.user.rol == 'usuario') {
        this.iniciarVibracion();
      } else if (this.estado_viaje !== 'Conductor Llego a Salida' && this.user.rol == 'usuario') {
        this.detenerVibracion();
      }
      this.activeBtnLlegue();

      //   if(this.estado_viaje == 'Conductor')
    }, 2500); // Verifica cada 1 segundo
  }

  async iniciarVibracion() {
    /*  this.vibrando = true;
      this.vibration.vibrate([1000, 500, 1000]); // Vibra 1s, pausa 0.5s, vibra 1s
   */
    this.vibrando = true;
    // navigator.vibrate([1000, 500, 1000]);

    // Continuar vibrando mientras isVibrating sea true
    this.vibracionInterval = setInterval(async () => {
      if (this.vibrando) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        this.playNotificationSound();
      } else {
        clearInterval(this.vibracionInterval); // Detener la vibración cuando isVibrating es false
      }
    }, 1500); // Intervalo de 500ms entre vibraciones

    await Haptics.impact({ style: ImpactStyle.Heavy });
  }



  /*detenerVibracion() {
    this.vibrando = false;
    navigator.vibrate(0); // Detiene la vibración
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }*/

  // Detener vibración
  detenerVibracion() {
    this.vibrando = false; // Cambiar la condición a false
  }

  playNotificationSound() {
    const audio = new Audio('assets/sound/notificacion.mp3');
  }

  atenderNoti() {
    try {
      var data = {
        id: this.idViaje,
        estado: 'Usuario Va en Camino'
      }
      this.estado_viaje = 'Notificar'
      this.api.updateEstadoViaje({ data }).subscribe((re) => {
        this.detenerVibracion();
      });

      var noti = {
        userId: this.idTokenOne,
        sonido: 'vacio',
        title: 'Viaje - Usuario',
        message: `${this.user.nombre}, ya va hacia ti.`,
        fecha: this.obtenerFechaHoraLocal(),
        idUser: this.idConductor,
        tipo: 'viaje'
      }

      const response = this.onesignal.enviarNotificacion(noti);
      response.subscribe((resp) => {
        return 0;
      })
    } catch (error) {
      console.error(error)
    }
  }


  async mostrarModalCalificacion() {
    var id = null;
    if (this.rol == 'user') {
      id = this.idConductor;
    } else {
      id = this.idUser
    }
    const modal = await this.modalController.create({
      component: CalificacionComponent,
      componentProps: {
        emisorId: this.idUser, // Cambiar dinámicamente
        receptorId: id, // Cambiar dinámicamente
        idViaje: this.idViaje,
        rol: this.rol
      },
      backdropDismiss: false // Evita que el usuario cierre el modal sin calificar
    });
    await modal.present();
  }



  // Método para abrir el action sheet
  async callSeguridad() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Emergencia',  // Título del action sheet
      buttons: [
        {
          text: 'Llamar a la policía',
          icon: 'call',
          handler: () => {
            // Lógica para llamar a la policía (puedes usar `makeCall` o cualquier otra acción)
            this.makeCallSeguridad('911');  // Por ejemplo, llamar al 911
          }
        },
        {
          text: 'Llamar a bomberos',
          icon: 'call',
          handler: () => {
            // Lógica para llamar a los bomberos
            this.makeCallSeguridad('112');  // Número ficticio, reemplázalo con el número real
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Acción cancelada');
          }
        }
      ]
    });

    await actionSheet.present();
  }

  // Método para hacer la llamada (lo puedes personalizar según el número)
  makeCallSeguridad(phoneNumber: string) {
    // Aquí usarías algo como `window.open('tel:' + phoneNumber)` para realizar la llamada en una app móvil
    window.open(`tel:${phoneNumber}`, '_system');
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0'); // Obtiene el día con 2 dígitos
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes con 2 dígitos
    const year = now.getFullYear().toString(); // Obtiene el año

    return `${day}${month}${year}`;
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // Horas con 2 dígitos
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Minutos con 2 dígitos
    const seconds = now.getSeconds().toString().padStart(2, '0'); // Segundos con 2 dígitos

    return `${hours}${minutes}${seconds}`;
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

  capitalizar(texto: any) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  async getCallSecurity() {
    try {
      const res = await this.apiCon.getCallSecurity().toPromise();
      if (res.success === true) {


        const data = res.result;

        this.callPolicia = data.find((item: any) => item.nombre === 'Policia');
        this.callBomberos = data.find((item: any) => item.nombre === 'Bomberos');
        this.callCruzRoja = data.find((item: any) => item.nombre === 'Cruz Roja');

      }
    } catch (error) {
      console.log("No se recuperaron los numero :", error)
    }
  }


  getChatsNoLeido() {

    if (this.user && this.rol && this.profile) {

      const data = {
        idViaje: this.idViaje,
        emisor_id: this.user.idUser,
        receptor_id: this.profile.idUser
      }

      this.api.getMensajesNoLeidos(data).subscribe((re: any) => {
        if (re.success) {
          this.isChat = re.result;
        }
      })

    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.intervalIdChat) {
      clearInterval(this.intervalIdChat);
    }
  }
}
