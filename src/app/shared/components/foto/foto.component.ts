import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { AzureFaceApiService } from 'src/app/core/services/azure-face-api.service';
import { AlertController } from '@ionic/angular';
import { AlertfaceComponent } from '../alertface/alertface.component';

@Component({
  selector: 'app-foto',
  templateUrl: './foto.component.html',
  styleUrls: ['./foto.component.scss'],
})
export class FotoComponent implements OnInit {

  @Input() markers: { lat: number; lon: number; label?: string }[] = [];
  latitude: number | undefined;
  longitude: number | undefined;
  isFoto: boolean = false;
  validando: boolean = false;
  statusValidation: any = null;
  user: any = null;
  imageBase64: any = null;
  actionSheet: any = null
  constructor(private actionSheetController: ActionSheetController,
    public toastController: ToastController,
    private authService: AuthService,
    private modalController: ModalController,
    private faceApi: AzureFaceApiService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private currentUser: UserService) {
  }

  ngOnInit() {

    this.getUser();
  }

  async getFoto() {
    try {
      var response = await this.currentUser.getFoto(this.user.idUser
      );

      response.subscribe((re) => {
        var data = re.result;
        this.imageBase64 = data.foto;
      })
    } catch (error) {
      console.error(error)
    }
  }

  getUser() {
    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated) {
      this.user = this.authService.getUser();
      this.getFoto();
    }
  }

  async presentActionSheet() {
    this.actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar una opción',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => this.tomarImage(),
        },
        {
          text: 'Elegir de la Galería',
          icon: 'image',
          handler: () => this.selectImage(),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await this.actionSheet.present();
  }

  async tomarImage() {
    this.actionSheet.dismiss();
    // Solicitar permisos antes de tomar la foto
    const permission = await Camera.requestPermissions();

    if (permission.camera !== 'granted') {
      console.error('Permiso de cámara denegado');
      return;
    }
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl, // Devuelve la imagen en base64
      source: CameraSource.Camera,  // Cambia a CAMERA para tomar foto
    });

    const base64Image = image.dataUrl;
    const data = {
      image: base64Image, // Enviar la imagen en Base64
      id: this.user.idUser
    };


    const hayRostro = await this.detectarRostro(base64Image);
    if (hayRostro) {
      const response = await this.currentUser.updateProfile(data);
      response.subscribe((re) => {
        if (re?.data) {
          const data = re.data;
          this.imageBase64 = data.url;
          this.isFoto = true;
          this.updateFoto();
        }
      })
    } else {
      console.log('❌ No se detectó rostro en la imagen');
    }
  }


  async selectImage() {
    // Solicitar permisos antes de tomar la foto
    /* const permission = await Camera.requestPermissions();
 
     if (permission.camera !== 'granted') {
       console.error('Permiso de cámara denegado');
       return;
     } */
    this.actionSheet.dismiss();
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl, // Devuelve la imagen en base64
      source: CameraSource.Photos // Abre la  galeria
    });


    const base64Image = image.dataUrl;

    //  this.imageBase64 = base64Image;
    const data = {
      image: base64Image, // Enviar la imagen en Base64
      id: this.user.idUser
    };


    const hayRostro = await this.detectarRostro(base64Image);
    if (hayRostro) {
      const response = await this.currentUser.updateProfile(data);
      response.subscribe((re) => {
        if (re?.data) {
          const data = re.data;
          this.imageBase64 = data.url;
          this.isFoto = true;
          this.updateFoto();
        }
      })
    } else {
      console.log('❌ No se detectó rostro en la imagen');
      this.showErrorAlert('No se detectó rostro en la imagen.');
    }

  }

  async updateFoto() {
    try {
      var data = {
        id: this.user.idUser,
        foto: this.imageBase64
      }
      var response = await this.currentUser.updateFotoPerfil(data);
      response.subscribe((re) => {
        this.getFoto()
        this.popUp();
        this.authService.refreshLogin(re);
        this.isFoto = false;
      })
    } catch (error) {
      console.log(error)
    }
  }

  async popUp() {
    const toast = await this.toastController.create({
      message: 'Foto cargada correctamente.',
      duration: 3000,
      color: 'success'
    });
    toast.present();
  }


  async detectarRostro(imageBase64: any): Promise<boolean> {
    this.validando = true;
    const loading = await this.presentLoading('Validando imagen...');

    return new Promise((resolve, reject) => {
      try {
        this.faceApi.detectFace(imageBase64).subscribe({
          next: (res) => {
            const data: any = res;
            this.validando = false;

            if (data.length > 0) {
              this.statusValidation = "rostro";
              console.log('Rostros detectados:', res);
              resolve(true); // ✅ rostro encontrado
            } else {
              this.statusValidation = "sinrostro";
              console.log('No se detectaron rostros:', res);
              resolve(false); // ❌ rostro no encontrado
            }
          },
          error: (err) => {
            this.validando = false;
            this.statusValidation = "sinrostro";
            console.error('Error al detectar rostro:', err);
            resolve(false); // ⚠️ fallo también se toma como no rostro
          }
        });
      } catch (error) {
        console.error(error);
        resolve(false); // ⚠️ error inesperado
      } finally {
        loading.dismiss(); // cerrar loading sin esperar
      }
    });
  }

  async presentLoading(message: string = 'Cargando...') {
    const loading = await this.loadingController.create({
      message,
      spinner: 'circles', // o 'dots', 'bubbles', 'lines', etc.
      cssClass: 'custom-loading',
      duration: 0, // 0 = no se cierra automáticamente
    });

    await loading.present();
    return loading; // lo retornamos para cerrarlo después
  }

  async showErrorAlert(message: string) {
    const modal = await this.modalController.create({
      component: AlertfaceComponent,
      componentProps: { message },
      backdropDismiss: false, // Opcional: para que solo cierre con el botón
       cssClass: 'custom-transparent-modal'
    });
    await modal.present();
  }
}
