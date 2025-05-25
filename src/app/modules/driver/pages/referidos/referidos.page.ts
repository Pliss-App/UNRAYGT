import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, NavController, NavParams, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { Clipboard } from '@capacitor/clipboard';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { UserService } from 'src/app/core/services/user.service';
import { TerminoscondicionesComponent } from 'src/app/shared/components/terminoscondiciones/terminoscondiciones.component';
import { ActivatedRoute } from '@angular/router';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-referidos',
  templateUrl: './referidos.page.html',
  styleUrls: ['./referidos.page.scss'],
})
export class ReferidosPage implements OnInit {

  segmentValue: string = 'compartir'; // valor inicial
  idUser: any = "";
  codigo: string = '';
  urlApp = '';
  codigoReferido: string = "";
  razon: any = 'registro';
  isReferido: boolean = false;
  isLoading: boolean = false;
  user: any;
  userRole: any;

  constructor(private menuController: MenuController, private navCtrl: NavController, private modalController: ModalController, private toastController: ToastController, private authService: AuthService,
    private socialSharing: SocialSharing, private api: UserService) {
    /* const isAuthenticated = this.authService.isAuthenticated();
 
     if (isAuthenticated) {
 
     }*/
    this.userRole = this.authService.getRole();
  }

  ngOnInit() {
   /*  this.codigo = this.navParams.get('codigo');
     this.idUser = this.navParams.get('idUser');
*/     this.user = this.authService.getUser();
    this.codigo = this.user.codigo;
    this.idUser = this.user.idUser;
    this.getYaReferido();
    this.getLinkApp();
  }

  async getYaReferido() {


    try {
      const response = await this.api.getReferido(this.idUser);
      response.subscribe((re) => {
        if (re?.success) {
          const data = re.result;
          this.isReferido = true;
          this.codigoReferido = data.codigoReferidor;

        } else {
          this.isReferido = false;
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  async getLinkApp() {
    try {
      const response = await this.api.getLinkApp();
      response.subscribe((re) => {
        if (re?.success) {
          const data = re?.result;
          this.urlApp = data.link;
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;

  }

  async copiarCodigo() {
    await Clipboard.write({
      string: this.codigo
    });

    const toast = await this.toastController.create({
      message: 'Código copiado',
      duration: 2000,
      color: 'success', // Verde
      position: 'bottom'
    });

    await toast.present();
  }


  async compartir() {
    const mensaje = `Únete con mi código: ${this.codigo} 👉 ${this.urlApp}`;
    // this.socialSharing.share(mensaje, "", this.urlApp);

    await Share.share({
      title: 'Invitación',
      text: mensaje,
      dialogTitle: 'Compartir con...'
    });
  }

  compartirWhatsApp() {
    const mensaje = `Únete con mi código: ${this.codigo} 👉 ${this.urlApp}`;
    this.socialSharing.share(mensaje, "", this.urlApp);
  }

  compartirFacebook() {
    const mensaje = `Únete con mi código: ${this.codigo}`;
    this.socialSharing.share(mensaje, "", this.urlApp);
  }

  compartirInstagram() {
    // Instagram no permite compartir solo texto. Necesitas compartir una imagen.
    const mensaje = `Mi código: ${this.codigo}`;
    const imagen = 'assets/img/referido.png'; // debe ser una imagen local
    this.socialSharing.share(mensaje, imagen);
  }

  compartirTwitter() {
    const mensaje = `Únete a la app con mi código: ${this.codigo}`;
    this.socialSharing.share(mensaje, "", this.urlApp);
  }


  async ingresarCodigo() {
    this.isLoading = true;
    if (this.codigo != this.codigoReferido) {
      if (this.codigoReferido != "") {
        try {
          const data = {
            codigo: this.codigoReferido,
            idUser: this.idUser,
            fecha: this.obtenerFechaLocal(),
            hora: this.obtenerHoraLocal(),
            razonreferencia: this.razon
          }
          const response = await this.api.insertReferido(data);
          response.subscribe((re) => {
            if (re?.success) {

              this.mostrarToast(re?.msg, 'success');
              this.getYaReferido();
            } else {
              this.mostrarToast(re?.msg, 'danger');
            }
            this.isLoading = false;
          })
        } catch (error) {
          this.isLoading = false;
          this.mostrarToast('Ocurrió un error en el servidor. Intenta más tarde.', 'danger');
        }

      } else {
        this.isLoading = false;
        this.mostrarToast('Aún no has ingresado código de referido.', 'danger');
      }
    } else {
      this.isLoading = false;
      this.mostrarToast('No puedes ingresar tu propio código.', 'danger');
    }

  }

  obtenerFechaLocal(): string {
    const now = new Date();
    return now.getFullYear() + "" +
      String(now.getMonth() + 1).padStart(2, "0") + "" +
      String(now.getDate()).padStart(2, "0")
  }

  obtenerHoraLocal(): string {
    const now = new Date();
    return String(now.getHours()).padStart(2, "0") + "" +
      String(now.getMinutes()).padStart(2, "0") + "" +
      String(now.getSeconds()).padStart(2, "0");
  }


  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger', duracion: number = 5000) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: 'top'
    });
    toast.present();
  }


  async abrirTerminos() {
    const modal = await this.modalController.create({
      component: TerminoscondicionesComponent,
      componentProps: {
        pdfUrl: 'assets/teco/terminos_condiciones.pdf'  // Asegúrate que el archivo esté allí
      }
    });
    await modal.present();
  }

  cerrar() {
    // this.modalController.dismiss();
    this.navCtrl.back();
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

}
