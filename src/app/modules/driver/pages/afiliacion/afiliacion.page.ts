import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, IonicSlides, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { AzureFaceApiService } from 'src/app/core/services/azure-face-api.service';

import { UserService } from 'src/app/core/services/user.service';
import { AlertfaceComponent } from 'src/app/shared/components/alertface/alertface.component';



@Component({
  selector: 'app-afiliacion',
  templateUrl: './afiliacion.page.html',
  styleUrls: ['./afiliacion.page.scss'],
})
export class AfiliacionPage implements AfterViewInit {
  @ViewChild('swiper', { static: false }) swiperRef!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;
  isLoading: any = null;
  swiperReady = false;
  currentStep = 0;
  currentStepIndex = 0;
  servicioSeleccionado: number | null = null;

  validando: boolean = false;
  statusValidation: any = null;



  steps = {
    perfil: {
      photo: '',
      completed: false,
    },
    dpi: {
      dpi_frontal: '',
      dpi_inverso: '',
      rostrodpi: '',
      completed: false,
    },
    vehiculo: {
      vehiculo_frontal: '',
      tarjeta_frontal: '',
      tarjeta_inverso: '',
      completed: false,
    },
    licencia: {
      licencia_frontal: '',
      licencia_inverso: '',
      completed: false,
    }
  };

  servicios: any = [];
  msgFace: string = "";

  user: any;
  constructor(private api: UserService,
    private navCtrl: NavController,
    private apiLogin: AuthService,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private faceApi: AzureFaceApiService,
    private authService: AuthService,
    private alertCtrl: AlertController) {
    this.user = this.authService.getUser();
    this.getServicios();

  }

  async ngAfterViewInit() {
    // await this.showAlert('Éxito', 'Afiliación enviada correctamente.', 'error');
    setTimeout(() => {
      this.swiperReady = true;

      const swiperEl = this.swiperRef?.nativeElement;
      if (swiperEl?.swiper) {
        swiperEl.swiper.allowTouchMove = false;
      }
    }, 300); // Espera a que el swiper se renderice correctamente
  }


  seleccionarServicio(id: number) {
    this.servicioSeleccionado = id;
  }

  async getServicios() {
    try {
      const res = await this.api.getServicioModo().toPromise();
      if (res.success === true) {
        this.servicios = res.result;
      }

    } catch (error) {

    }
  }
  preventTouch(event: any) {
    /*if (Math.abs(event.touches[0].clientX - event.touches[0].pageX) > 10) {
      event.preventDefault();
    } */

    event.stopPropagation(); //evita mover con los dedos
  }

  nextStep() {

    // Revalida el paso actual después de retroceder
    const currentKey = this.getStepKeyByIndex(this.currentStepIndex);
    if (currentKey) {
      this.validateSteps(currentKey);
    }

    if (this.currentStepIndex < 3) {
      this.currentStepIndex++;
      //  this.swiperRef.nativeElement.swiper.slideTo(this.currentStepIndex);

      const swiper = this.swiperRef?.nativeElement?.swiper;
      const currentIndex = swiper?.activeIndex || 0;

      let canProceed = false;
      let errorMessage = '';

      /* const swiper = this.swiperRef?.nativeElement?.swiper;
       if (swiper) {
         swiper.slideNext();
       } */

      switch (currentIndex) {
        case 0:
          canProceed = this.steps.perfil.completed;
          errorMessage = 'Debes subir tu foto de perfil';
          break;
        case 1:
          canProceed = this.steps.dpi.completed;
          errorMessage = 'Debes completar todas las fotos del DPI';
          break;
        case 2:
          canProceed = this.steps.vehiculo.completed;
          errorMessage = 'Debes completar toda la información del vehículo';

          break;
        case 3:
          canProceed = this.steps.licencia.completed;
          errorMessage = 'Debes subir ambos lados de tu licencia';
          break;
      }

      if (!canProceed) {
        // await this.showAlert('Validación requerida', errorMessage);
        return;
      }

      swiper?.slideNext();
    }
  }
  /*
    prevStep() {
   
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
     //   this.swiperRef.nativeElement.swiper.slideTo(this.currentStepIndex);
        const swiper = this.swiperRef?.nativeElement?.swiper;
        if (swiper) {
          swiper.slidePrev();
        }
      }
   
    }*/

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      const swiper = this.swiperRef?.nativeElement?.swiper;
      if (swiper) {
        swiper.slidePrev();
      }

      // Revalida el paso actual después de retroceder
      const currentKey = this.getStepKeyByIndex(this.currentStepIndex);
      if (currentKey) {
        this.validateSteps(currentKey);
      }
    }
  }

  getStepKeyByIndex(index: number): string | null {
    const keys = ['perfil', 'dpi', 'vehiculo', 'licencia'];
    return keys[index] || null;
  }

  async takePhoto(step: string, substep?: string) {
    const loading = await this.presentLoading('Validando imagen...');
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // Devuelve la imagen en base64
        source: CameraSource.Camera,  // Cambia a CAMERA para tomar foto
      });


      const mockPhoto = image.dataUrl || null;

      const data = {
        image: mockPhoto, // Enviar la imagen en Base64
        id: this.user.idUser
      };

      if (step == 'perfil' || substep == 'rostrodpi') {
        const hayRostro = await this.detectarRostro(mockPhoto);
        if (hayRostro) {


          this.msgFace = ""

          const response = await this.api.updateDocumentacion(data);
          response.subscribe((re) => {

            if (re?.data) {
              const data = re.data;
              if (substep) {
                (this.steps as any)[step][substep] = data.url;
              } else {
                (this.steps as any)[step].photo = data.url;
              }
              this.validateSteps(step);
            } else {
              this.toastController.create({
                message: 'Ocurrio error al cargar la foto.',
                duration: 3000,
                color: 'warning'
              }).then((toast: any) => toast.present());
            }

          })
        } else {
          this.showErrorAlert('No se detectó rostro en la imagen.Intenta con otra foto.');
        }
      } else {

        const response = await this.api.updateDocumentacion(data);
        response.subscribe((re) => {

          if (re?.data) {
            const data = re.data;
            if (substep) {
              (this.steps as any)[step][substep] = data.url;
            } else {
              (this.steps as any)[step].photo = data.url;
            }
            this.validateSteps(step);
          } else {
            this.toastController.create({
              message: 'Ocurrio error al cargar la foto.',
              duration: 3000,
              color: 'warning'
            }).then((toast: any) => toast.present());
          }

        })
      }



    } catch (error) {

      this.toastController.create({
        message: 'No se tomó ninguna foto',
        duration: 3000,
        color: 'warning'
      }).then((toast: any) => toast.present());
      // Aquí puedes incluso mostrar un Toast si quieres
    }
    finally {
      loading.dismiss(); // cerrar loading sin esperar
    }
  }

  triggerFileInput() {
    this.fileInput?.nativeElement.click();
  }



  validateSteps(step: string) {
    const s = this.steps as any;
    switch (step) {
      case 'perfil':
        s.perfil.completed = !!(s.perfil.photo);
        break;
      case 'dpi':
        s.dpi.completed = !!(s.dpi.rostrodpi && s.dpi.dpi_frontal && s.dpi.dpi_inverso);
        break;
      case 'vehiculo':
        s.vehiculo.completed = !!(s.vehiculo.vehiculo_frontal && s.vehiculo.tarjeta_frontal && s.vehiculo.tarjeta_inverso);
        break;

      case 'licencia':
        s.licencia.completed = !!(s.licencia.licencia_frontal && s.licencia.licencia_inverso);
        break;
    }
  }



  formatFechaNacimiento(event: any, step: any, inputRef: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 2) {
      input = input.slice(0, 2) + '/' + input.slice(2);
    }
    if (input.length > 5) {
      input = input.slice(0, 5) + '/' + input.slice(5, 9);
    }

    if (step == 'perfil') {
      // this.steps.perfil.fechaNacimiento = input;
    }


    if (step == 'dpi') {

      //  this.steps.dpi.fechavencimientodpi= input;
      //     console.log("VIEND DEL INPUTO DPI ,  ",   this.steps.dpi.fechavencimientodpi)
    }


    // this.steps.perfil.fechaNacimiento = input;
    this.validateSteps(step);

  }

  isCurrentStepValid(): boolean {
    switch (this.currentStepIndex) {
      case 0: return this.steps.perfil.completed;
      case 1: return this.steps.dpi.completed;
      case 2: return this.steps.vehiculo.completed;
      case 3: return this.steps.licencia.completed;
      default: return false;
    }
  }


  isAllStepsComplete(): boolean {
    return (
      this.steps.perfil.completed &&
      this.steps.dpi.completed &&
      this.steps.vehiculo.completed &&
      this.steps.licencia.completed
    );
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

  async submitForm() {
    this.isLoading = true;

    const data = {
      idUser: this.user.idUser,
      documentacion: this.steps,
      fecha: this.obtenerFechaHoraLocal(),
      idservicio: null
    };

    try {
      const res: any = await this.api.insertAfiliacion(data).toPromise();

      if (res.success === true) {
        await this.showAlert('Éxito', 'Tus documentos están en revisión. Este proceso puede tardar entre 24 y 48 horas. Has Recibido un Bono inicial de *Q50*.', 'success');
        // Aquí podrías redirigir o limpiar el formulario
      } else {
        await this.showAlert('Error', res.message || 'Hubo un problema al enviar la documentación.', 'error');
      }
    } catch (error) {
      await this.showAlert('Error', 'No se pudo completar la operación. Intenta más tarde.', 'error');
    }



    this.isLoading = false;
  }

  async showAlert(header: string, message: string, tipo: any) {

    const buttons = tipo === 'error'
      ? [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
      : [
        {
          text: 'Continuar',
          handler: async () => {

            window.location.reload();
          }
        }
      ];


    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: false,
      buttons: buttons, cssClass: tipo === 'error' ? 'custom-alert-error' : 'custom-alert-center'
    });
    await alert.present();
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


  async presentLoadingImg(message: string = 'Cargando...') {
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

  goBack() {
    this.navCtrl.back();
  }
}

