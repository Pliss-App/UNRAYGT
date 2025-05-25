import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AzureFaceApiService } from 'src/app/core/services/azure-face-api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActionSheetController, AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-documentacion',
  templateUrl: './documentacion.page.html',
  styleUrls: ['./documentacion.page.scss'],
})
export class DocumentacionPage implements OnInit {
  private actionSheetRef: HTMLIonActionSheetElement | null = null;
  form: FormGroup;
  active: boolean = true;
  fields: any = [];
  validando: boolean = false;
  statusValidation: any = null;
  isLoading = false;
  previews: { [key: string]: string } = {};
  //Referencias
  nombrereferencia1: any = "";
  parentescoreferencia1: any = "";
  contactoreferencia1: any = "";
  nombrereferencia2: any = "";
  parentescoreferencia2: any = "";
  contactoreferencia2: any = "";
  msgFace: string = "";

  imagesBase64: { [key: string]: string } = {};
  user: any = {};

  constructor(private faceApi: AzureFaceApiService,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private fb: FormBuilder, private userService: UserService,
    private authService: AuthService) {
    this.user = this.authService.getUser();
    this.getDocumentacion();
    const controls: { [key: string]: any } = {};
    this.fields.forEach((field: any) => {
      controls[field.nombre] = [null, Validators.required];
      // Inicializar previsualizaciones con la imagen por defecto
      this.previews[field.nombre] = 'https://www.utec.edu.sv/solicitud-maestrias/assets/img/default_img.png';
    });

    // Agregar manualmente los campos de referencia
    //controls['fechavencimientodpi'] = [null, Validators.required];
    //controls['fechavencimientotarcirculacion'] = [null, Validators.required];
    controls['placa'] = [null, Validators.required];
    controls['modelo'] = [null, Validators.required];
    controls['color'] = [null, Validators.required];

    controls['nombrereferencia1'] = [null, Validators.required];
    controls['parentescoreferencia1'] = [null, Validators.required];
    controls['contactoreferencia1'] = [null, [Validators.required, Validators.pattern(/^[0-9]{8}$/)]]; // Validación para teléfono de 8 dígitos

    // Agregar manualmente los campos de referencia
    controls['nombrereferencia2'] = [null, Validators.required];
    controls['parentescoreferencia2'] = [null, Validators.required];
    controls['contactoreferencia2'] = [null, [Validators.required, Validators.pattern(/^[0-9]{8}$/)]]; // Validación para teléfono de 8 dígitos


    this.form = this.fb.group(controls);

  }

  ngOnInit() {

  }

  async getDocumentacion() {
    /*   const loading = await this.loadingController.create({
         message: 'Verificando documentación...',
         spinner: 'crescent',
         duration: 10000, // Tiempo máximo antes de que se cierre el loading
       }); */

    // await loading.present();
    try {
      this.userService.getDocumentacionRequisitos().subscribe(async (re: any) => {
        this.fields = re?.result;
        this.active = false;

      })
    } catch (error) {
      console.error('Error verificando la documentación:', error);
    } finally {
      // Cierra el loading
      //    await loading.dismiss();
    }

  }

  async presentActionSheet(fieldName: string) {
    this.actionSheetRef = await this.actionSheetController.create({
      header: 'Seleccionar una opción',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => this.captureImage(fieldName),
        },
        {
          text: 'Elegir de la Galería',
          icon: 'image',
          handler: () => this.selectImage(fieldName),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    //   await actionSheet.present();
    await this.actionSheetRef.present();
  }

  async captureImage(fieldName: string) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl, // Devuelve la imagen en base64
      source: CameraSource.Camera // Abre la cámara directamente
    });
    const base64Image = image.dataUrl;


    if (fieldName == 'dpi_frontal' || fieldName == 'rostrodpi' || fieldName == 'perfil') {
      const hayRostro = await this.detectarRostro(base64Image);
      if (hayRostro) {
         this.msgFace="";
        this.previews[fieldName] = image.dataUrl ?? ''; // Actualizar la previsualización
        this.imagesBase64[fieldName] = image.dataUrl ?? ''; // Guardar el Base64
        this.form.controls[fieldName].setValue(image.dataUrl); // Validar el campo
      } else {
        console.log('❌ No se detectó rostro en la imagen');
        this.msgFace = 'No se detectó rostro en la imagen.Intenta con otra foto.'
      }
    } else {
      this.previews[fieldName] = image.dataUrl ?? ''; // Actualizar la previsualización
      this.imagesBase64[fieldName] = image.dataUrl ?? ''; // Guardar el Base64
      this.form.controls[fieldName].setValue(image.dataUrl); // Validar el campo
    }

    this.cerrarActionSheet();

  }

  async selectImage(fieldName: string) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl, // Devuelve la imagen en base64
      source: CameraSource.Photos // Abre la  galeria
    });
    // const base64Image = image.dataUrl;
    const base64Image = image.dataUrl;

    if (fieldName == 'dpi_frontal' || fieldName == 'rostrodpi' || fieldName == 'perfil') {
      const hayRostro = await this.detectarRostro(base64Image);
      if (hayRostro) {

        this.previews[fieldName] = image.dataUrl ?? ''; // Actualizar la previsualización
        this.imagesBase64[fieldName] = image.dataUrl ?? ''; // Guardar el Base64
        this.form.controls[fieldName].setValue(image.dataUrl); // Validar el campo
      } else {
        console.log('❌ No se detectó rostro en la imagen');
      }
    } else {

      this.previews[fieldName] = image.dataUrl ?? ''; // Actualizar la previsualización
      this.imagesBase64[fieldName] = image.dataUrl ?? ''; // Guardar el Base64
      this.form.controls[fieldName].setValue(image.dataUrl); // Validar el campo
    }
  }

  async onSubmit() {
    this.isLoading = true; // Mostrar indicador de carga mientras se procesa la solicitud

    if (this.form.valid) {
      // Llamada al servicio para enviar los datos
      var data = {
        carga: 'App',
        documentacion: this.imagesBase64,
        idUser: this.user.idUser,
      }
      this.userService.insertDocumentos(data).subscribe({
        next: async (response) => {
          this.isLoading = false;
          this.imagesBase64 = {};
          this.previews = {};
          this.onReset();
          this.getDocumentacion();
          // Mostrar mensaje de éxito
          const successAlert = await this.alertController.create({
            header: 'Éxito',
            message: 'Los documentos se enviaron correctamente.',
            cssClass: 'alert-custom',
            buttons: [{
              text: 'OK',
              handler: () => {
                this.navCtrl.navigateRoot('/driver'); // Reemplaza '/inicio' con la ruta correcta de tu página de inicio
              }
            }],
          });
          await successAlert.present();
        },
        error: async (error) => {
          this.isLoading = false;
          // Mostrar mensaje de error
          const errorAlert = await this.alertController.create({
            header: 'Error',
            message: 'Hubo un problema al enviar los documentos. Intenta nuevamente.',
            buttons: ['OK'],
          });
          await errorAlert.present();
        },
      });
    } else {
      // Validación del formulario
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos correctamente.',
        duration: 3000,
        color: 'warning',
      });
      toast.present();
    }
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
              resolve(true); // ✅ rostro encontrado
            } else {
              this.statusValidation = "sinrostro";
              resolve(false); // ❌ rostro no encontrado
            }
          },
          error: (err) => {
            this.validando = false;
            this.statusValidation = "sinrostro";
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


  // Resetear el formulario
  onReset() {
    this.form.reset(); // Restablece el formulario a su estado inicial
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

  cerrarActionSheet() {
    if (this.actionSheetRef) {
      this.actionSheetRef.dismiss();
      this.actionSheetRef = null; // Limpiar la referencia
    }
  }

  logout() {

    this.authService.logout();

  }
}
