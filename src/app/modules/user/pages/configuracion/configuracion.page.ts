import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {
  userRole: any;
  viajes: any[] = [];
  offset = 0;
  userId = 1; // ID del usuario autenticado
  role = "usuario"; // "usuario" o "conductor"
  user: any = null;

  constructor(private api: UserService,public toastController: ToastController,
    private auth: AuthService, private menuController: MenuController, private loadingCtrl: LoadingController,
    private navCtrl: NavController, private alertController: AlertController) {

    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
  }

  ngOnInit() {
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  logout() {

    this.menuController.close();
    const data = {
      telefono: this.user.telefono
    }
    this.api.updateLogout(data).subscribe((re)=>{
      this.auth.logout();
    })
 

  }

  async eliminar() {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando cuenta...', // Mensaje que se muestra
      spinner: 'crescent', // Tipo de spinner
      backdropDismiss: false, // No se puede cerrar tocando fuera
    });

    await loading.present(); // Muestra el loading

    try {
      const data = { id: this.user.idUser };
      const response = this.api.eliminarCuenta(data);

      response.subscribe(
        async (re) => {
          await loading.dismiss(); // Oculta el loading cuando hay respuesta

          if (re.success) {
            this.logout();
          } else {

            this.errorDuranteCreacion('Ocurrio un error al eliminar la cuenta. Intena más tarde.')
            console.log('ERROR AL ELIMINAR');
          }
        },
        async (error) => {
          await loading.dismiss();
          console.error(error);
        }
      );
    } catch (error) {
      await loading.dismiss();
      console.error(error);
    }
  }

  async confirmLogout(item: any, title: any, text: any) {
    const alert = await this.alertController.create({
      header: title,
      message: text,
      cssClass: 'custom-alert',
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      animated: true,
      backdropDismiss: false, // Evita que se cierre tocando fuera
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: item == 'logout' ? 'Salir' : 'Eliminar',
          handler: () => {

            if (item == 'logout') {
              this.logout();
            } else if (item == 'delete') {
              // console.log("Elominar cuenta")
              this.eliminar();
            }

          },
          cssClass: 'logout-button'
        }
      ]
    });

    await alert.present();
  }

  async errorDuranteCreacion(item: any) {
    const toast = await this.toastController.create({
      message: `${item}`,
      duration: 4000,
      position: 'top',
      color: 'danger'  
    });
    toast.present();
  }



  goBack() {
    this.navCtrl.back();
  }

}
