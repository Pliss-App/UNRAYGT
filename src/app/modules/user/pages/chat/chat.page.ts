import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { AuthService } from 'src/app/core/services/auth.service';
//import { Socket } from 'socket.io-client';
//import { Socket } from 'socket.io-client';
//import { Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @Input() emisorId: number | undefined; // ID del usuario actual
  @Input() receptorId: number | undefined; // ID del conductor
  @Input() idViaje: number | undefined; // ID del usuario actual
  mensajes: any[] = [];
  smsDefinidos: any[] = [];
  mensaje = '';
  @ViewChild('chatContent', { static: false }) chatContent: IonContent | undefined;
  @ViewChild(IonContent) content: IonContent | undefined;
  isScrolledToBottom = true; // Estado para detectar si el usuario está desplazado al fondo
  isSelect: boolean = false;
  storedData: any = '';
  userRole: any;

  constructor(
    private storageService: StorageService,
    private onesignal: OnesignalService,
    private alertCtrl: AlertController,
    private auth: AuthService,
    private modalController: ModalController,
    private uSer: UserService) {
    this.userRole = this.auth.getRole();
  }

  async ngOnInit() {
  //  this.storageService.removeItem('sms-definido');
    this.getSMSAutomatico();

    this.cargarMensajes();
    setInterval(() => {
      this.cargarMensajes();
      if (this.isScrolledToBottom) {
        this.scrollToBottom(); // Desplazar hacia abajo si el usuario no ha desplazado hacia arriba
      }
    }, 1000)

  }
  ngAfterViewInit() {
    this.scrollToBottom();
  }

  async getSMSAutomatico() {
    this.storedData = await this.storageService.getItem('sms-definido');
    if (this.storedData == null) {
      this.isSelect = false;
      if (this.userRole == 'conductor') {
        this.getSMSDefinido('conductor');
      } else {
        this.getSMSDefinido('user');
      }

    } else {
      this.isSelect = true;
    }

  }
  // Detectar el desplazamiento del usuario
  onScroll(event: any) {
    this.isScrolledToBottom = event.detail.scrollTop + event.detail.clientHeight === event.detail.scrollHeight;
  }

  scrollToBottom() {
    // Espera un ciclo de vida para asegurarse de que los cambios estén reflejados
    setTimeout(() => {
      this.content?.scrollToBottom(0); // Desplazar al fondo con un tiempo de animación de 300 ms
    }, 100);
  }

  async getSMSDefinido(item: any) {
    try {
      const response = this.uSer.getSMSDefinido(item);
      response.subscribe((re: any) => {
        this.smsDefinidos = re.result;
      })
    } catch (error) {
      console.error('Error al consultar mensajes:', error);
    }
  }

  cargarMensajes() {
    try {
      const response = this.uSer.getMensajes(this.idViaje, this.emisorId, this.receptorId);
      response.subscribe((re: any) => {
        this.mensajes = re.result;

      })
      if (this.isScrolledToBottom) {
        this.scrollToBottom(); // Desplazar hacia abajo si el usuario no ha desplazado hacia arriba
      }
    } catch (error) {
      console.error('Error al consultar mensajes:', error);
    }
  }

  enviarMensaje() {
    if (this.mensaje != '') {
      const data = {
        idViaje: this.idViaje,
        emisor_id: this.emisorId,
        receptor_id: this.receptorId,
        mensaje: this.mensaje,
      };

      var noti = {

        userId: null,
        sonido: 'vacio',
        title: 'Chat',
        message: this.mensaje,
        fecha: this.  obtenerFechaHoraLocal(),
        idUser:  this.receptorId,
      }
      this.onesignal.getToken(this.receptorId).subscribe((resp => {



        var data = resp.result;
        var token = data.onesignal_token;
        noti.userId = token
        //this.idTokenOne = token;


        const response = this.onesignal.enviarNotificacion(noti);
        response.subscribe((resp) => {
          return 0;
        })
      }))
      const response = this.uSer.sendMensajes(data);
      response.subscribe((re) => {
        this.scrollToBottom();
        this.cargarMensajes();
      })
      //  this.socket.emit('sendMessage', data);
      this.mensajes.push(data); // Mostrar el mensaje enviado
      this.mensaje = ''; // Limpiar input
    }
  }


  selectSMS(item: any) {
    const data = {
      idViaje: this.idViaje,
      emisor_id: this.emisorId,
      receptor_id: this.receptorId,
      mensaje: item.mensaje,
    };
    const response = this.uSer.sendMensajes(data).toPromise();
    response.then(async (re) => {
      this.isSelect = true;
      await this.storageService.setItem('sms-definido', { valor: true });
    })
  }

  closeModal() {
    this.modalController.dismiss();
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


  async showErrorAlert(error: any) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudo conectar al servidor. Por favor, intenta nuevamente más tarde.',
      buttons: ['Aceptar'],
    });
    await alert.present();
  }
}
