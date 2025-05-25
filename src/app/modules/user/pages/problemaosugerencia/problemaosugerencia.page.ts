import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-problemaosugerencia',
  templateUrl: './problemaosugerencia.page.html',
  styleUrls: ['./problemaosugerencia.page.scss'],
})
export class ProblemaosugerenciaPage implements OnInit {
  tipoReporte = '';
  descripcion = '';
  imagen: any = null;
  userRole: any;
  user: any = null;
  isLoading = false; 

  constructor(private api: UserService, private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private auth: AuthService, private menuController: MenuController, private actionSheetCtrl: ActionSheetController,
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



  async seleccionarImagen() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar Imagen',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => {
            this.capturarImagen(CameraSource.Camera);
          },
        },
        {
          text: 'Seleccionar de Galería',
          icon: 'image',
          handler: () => {
            this.capturarImagen(CameraSource.Photos);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async capturarImagen(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source,
      });

      this.imagen = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('Error al capturar imagen', error);
    }
  }

  eliminarImagen() {
    this.imagen = null;
  }



  async enviarReporte() {
    this.isLoading = true; // Deshabilita el botón
    const loading = await this.loadingCtrl.create({
      message: 'Enviando reporte...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const data = {
        idUser: 1, // Reemplázalo con el ID real del usuario
        tipo: this.tipoReporte,
        descripcion: this.descripcion,
        imagen: this.imagen,
      };

      const response = await this.api.insertProblemaSugerencia(data).toPromise();
      
      if (response.success) {
        await this.showAlert('Reporte Enviado', 'Tu reporte se ha enviado con éxito.', 'success');
        this.tipoReporte = '';
        this.descripcion = '';
        this.imagen = null;
      } else {
        throw new Error('Hubo un problema al enviar el reporte.');
      }
    } catch (error) {
      console.error(error);
      await this.showAlert('Error', 'No se pudo enviar el reporte. Inténtalo de nuevo.', 'danger');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async showAlert(header: string, message: string, color: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: `alert-${color}`,
    });
    await alert.present();
  }

  goBack() {
    this.navCtrl.back();
  }
}
