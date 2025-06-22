import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import Tesseract from 'tesseract.js';
import { IMAGES } from 'src/app/constaints/image-data';
import { ToastController } from '@ionic/angular';
import { DetallesCuentaPage } from '../detalles-cuenta/detalles-cuenta.page';
import { ConductorService } from 'src/app/core/services/conductor.service';
import { catchError, of, timeout } from 'rxjs';
import { AyudaBoletaPage } from '../ayuda-boleta/ayuda-boleta.page';

@Component({
  selector: 'app-recargar-billetera',
  templateUrl: './recargar-billetera.page.html',
  styleUrls: ['./recargar-billetera.page.scss'],
})

export class RecargarBilleteraPage implements OnInit {
  paymentForm: FormGroup;
  photoBase64: any = null;
  photoBase64Prev: any = null;
  user: any = {};
  extractedText: string = '';
  keyValueData: { key: string; value: string }[] = [];
  alert: any;
  loading: any;
  formValidFields = {
    receiptNumber: '',
    amount: ''
  };
  isImageValid: boolean = false;  //

  guatemalaBanks = [
    'Banco Industrial',
    'Banco G&T Continental',
    'Banco de América Central',
    'Banco Promerica',
    'Bancos de los Trabajadores',
    'Banrural',
    'Creditea',
    'Ficohsa',
    'Banco Azteca',
    'Banco BAC',
    'Scotiabank',
    // Agrega más bancos aquí...
  ];
  isOnline: boolean = false;
  estado_usuario: any;

  constructor(private iab: InAppBrowser, private api: UserService, private auth: AuthService,
    private fb: FormBuilder,
    private driverService: ConductorService,
    private alertCtrl: AlertController, public actionSheetController: ActionSheetController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {
    this.user = this.auth.getUser();
    if (this.user) {
      this.getEstado();
    }

    this.paymentForm = this.fb.group({
      receiptNumber: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    });

  }
  async ngOnInit(): Promise<void> {
    // throw new Error('Method not implemented.');
  }

  getEstado() {
    try {
      this.api.getEstado(this.user.idUser).subscribe((re) => {
        if (re.success) {
          var data = re.result;
          this.isOnline = data.estado;
          this.estado_usuario = data.estado_usuario;
        }
      })
    } catch (error) {
      console.error(error);
    }
  }


  openVisaLink() {
    const browser = this.iab.create('https://mallvirtualvisanet.com.gt/formulario-de-pago/1556/pliis-technology-businesses', '_blank', {
      location: 'yes', // Muestra barra de herramientas del navegador
      toolbar: 'yes',  // Barra de navegación
      zoom: 'no',      // Desactiva el zoom
    });
  }

  async openPhotoOptions() {
    const alert = await this.alertCtrl.create({
      header: 'Cargar Foto',
      message: 'Selecciona una opción:',
      mode: 'ios',
      cssClass: 'cargar-imagen-alert',
      buttons: [
        {
          text: '📸Usar cámara',
          handler: () => this.captureImage(),
        },
        {
          text: '🎞️Desde galería',
          handler: () => this.selectImage(),
        },
        { text: '❌ Cancelar', role: 'cancel' },
      ],
    });
    await alert.present();
  }



  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 99,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,// Devuelve la imagen en base64 
      source: CameraSource.Camera // Abre la cámara directamente
    });
    this.photoBase64 = image.dataUrl;
    if (this.photoBase64) {
      this.getValidaImagen(this.photoBase64);
    }

  }

  async getValidaImagen(foto: any) {
    await this.mostrarLoading('Validando imagen. Puede llevar un tiempo...');  // Mostrar loading
    const data = {
      imageBase64: foto
    }

    try {
      this.driverService.validateImagen(data).subscribe({
        next: (re: any) => {
          if (re.success) {
            const data = re.extractedData;
            this.paymentForm.patchValue({
              receiptNumber: data.receiptNumber
            });
            this.paymentForm.patchValue({
              amount: data.amount
            });
            this.isImageValid = true;
            if (this.loading) this.loading.dismiss();
            this.mostrarAlerta('Imagen válida', ``, 'success');
          } else {
            this.isImageValid = false;
            if (this.loading) this.loading.dismiss();
            this.mostrarAlerta('Imagen inválida', ``, 'error');
          }
        },
        error: (err) => {
          if (this.loading) this.loading.dismiss();

          // Error con código HTTP como 413, 500, etc.
          if (err.status === 413) {
            this.mostrarAlerta('Imagen demasiado grande', err.error?.msg || 'Reduce la calidad o tamaño de la imagen.', 'error');
          } else {
            this.mostrarAlerta('Error de red', 'Ocurrió un problema al validar la imagen. Intenta más tarde.', 'error');
          }
        }
      });
    } catch (error) {
      if (this.loading) {
        this.loading.dismiss();
      }
      this.mostrarAlerta('Error desconocido', `En este momento no podemos procesar tu solicitud. Intenta más tarde`, 'error');
    }
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 99,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,// Devuelve la imagen en base64
      source: CameraSource.Photos // Abre la cámara directamente
    });

    this.photoBase64 = image.dataUrl;
    if (this.photoBase64) {
      this.getValidaImagen(this.photoBase64);
    }
  }

  async submitForm() {
    if (!this.paymentForm.valid || !this.photoBase64) {
      this.showAlert('Validación', 'Por favor, completa todos los campos y carga tu voucher o boleta.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando datos...',
    });
    await loading.present();

    const dataFoto = {
      image: this.photoBase64,
      id: this.user.idUser
    };

    // ✅ Subir la imagen primero
    this.api.imageBoletaPago(dataFoto).pipe(
      timeout(10000),
      catchError(err => {
        loading.dismiss();
        this.showAlert('Error', 'No pudimos subir la imagen. Intenta más tarde.');
        return of(null);
      })
    ).subscribe(re => {
      if (re?.data && re.data.url) {
        const fotoUrl = re.data.url;

        const data = {
          iduser: this.user.idUser,
          boleta: this.paymentForm.value.receiptNumber,
          monto: this.paymentForm.value.amount,
          url: fotoUrl
        };

        // ✅ Enviar la recarga
        this.api.recargarBilletara(data).pipe(
          timeout(10000),
          catchError(err => {
            loading.dismiss();
            this.showAlert('Error de conexión', 'No pudimos registrar el pago. Intenta más tarde.');
            return of(null);
          })
        ).subscribe(async (res) => {
          loading.dismiss();

          if (res?.success) {
            if (this.estado_usuario === 'bloqueo' && this.isOnline === false) {
              await this.getSaldoBloqueoViaje();
            }

            this.showAlert('Éxito', 'Datos enviados correctamente.');
            this.resetForm();
            this.isImageValid = false;
          } else {
            this.showAlert('Error', 'No se pudo guardar tu recarga. Verifica tu información.');
            this.isImageValid = true;
          }
        });

      } else {
        loading.dismiss();
        this.showAlert('Error', 'Error al subir la imagen. Intenta nuevamente.');
      }
    });
  }

  resetForm() {
    this.paymentForm.reset();
    this.photoBase64 = null;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
      mode: 'ios',
      cssClass: 'custom-alert-billetera', // Aplica estilos personalizados
    });
    await alert.present();
  }

  async extractTextFromImage(image: string) {
    try {
      const { data } = await Tesseract.recognize(image, 'eng'); // OCR en inglés       
      this.extractedText = data.text;
      this.processExtractedText(this.extractedText);
      // Validación de bancos en el texto extraído
      //const isValidBank = this.validateBankInText(this.extractedText);
      // Mostrar un alert con el resultado de la validación
      if (this.extractedText) {


      } else {
        if (this.loading) {
          this.loading.dismiss();
        }
        this.isImageValid = false;  // Imagen válida
        this.mostrarAlerta('Error', 'La imagen no es válida.', 'success');
      }

    } catch (error) {
      console.error('Error en OCR:', error);
      // Mostrar alerta en caso de error
      this.mostrarAlerta('Error', 'Hubo un problema al procesar la imagen.', 'error');

      // Cerrar el loading si ocurre un error
      if (this.loading) {
        this.loading.dismiss();
      }
    }
  }

  processExtractedText(text: string) {
    const comprobanteRegex = /(Comprobante|No\.|Número|Transaccion|No\.\s*de\s*autorización|Numero\.\s*de\s*deposito|No\.\s*de\s*autorizacion|Número\s*de\s*Depósito|Código\s*de\s*autorizacion|Cddigo\s*de\s*autorizacion|No\.\s*de\s*Referencia):?\s*(\d+)/i;
    const fechaRegex = /(Fecha|Date):?\s*([\d\/\-]+)/i;
    const montoRegex = /(Monto|Cantidad|Total|por un valor de|Monto\s*a\s*debitar):?\s*(Q|GTQ|\$)?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/i;


    this.keyValueData = [];

    // Buscar número de comprobante
    const comprobanteMatch = text.match(comprobanteRegex);
    if (comprobanteMatch) {
      this.paymentForm.patchValue({
        receiptNumber: comprobanteMatch[2]
      });
    }

    // Buscar fecha
    const fechaMatch = text.match(fechaRegex);
    if (fechaMatch) {
      this.keyValueData.push({ key: 'Fecha', value: fechaMatch[2] });
    }

    // Buscar monto
    const montoMatch = text.match(montoRegex);
    if (montoMatch) {

      let montoRaw = montoMatch[3]; // Captura el monto de la expresión regular

      // Reemplaza solo las comas que están como separadores de miles
      let montoFormateado = montoRaw.replace(/(?<=\d),(?=\d{3}\b)/g, '');

      let montoFinal = parseFloat(montoFormateado); // Convierte a número

      if (!isNaN(montoFinal)) {
        this.paymentForm.patchValue({
          amount: montoFinal
        });
        console.log("Monto formateado y válido:", montoFinal);
      } else {
        console.error("Error: El monto no es un número válido");
      }

    }

    // Validar si los datos clave están presentes
    if (this.paymentForm.value.receiptNumber && this.paymentForm.value.amount) {
      this.isImageValid = true;
      this.mostrarAlerta('Imagen Válida', '¡Tu imagen es válida!', 'success');
    } else {
      this.isImageValid = false;
      this.mostrarAlerta('Imagen Inválida', 'Parece que la imagen no cumple con los parámetros de boleta o transferencia bancaria.', 'error');
    }

    // Cerrar el loading después de la validación
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  // Método para mostrar un alert
  async mostrarAlerta(titulo: string, mensaje: string, tipo: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
      mode: 'ios',
      cssClass: tipo == 'success' ? 'custom-alert-imagen' : 'custom-alert-imagen-error', // Aquí agregamos una clase personalizada
    });

    await alert.present();
  }


  // Método para mostrar un loading
  async mostrarLoading(message: string) {
    this.loading = await this.loadingCtrl.create({
      message: message,
      mode: 'ios',
      spinner: 'crescent',  // Puedes cambiar el spinner si lo deseas
    });
    await this.loading.present();
  }

  async mostrarApoyoBilletera() {
    const modal = await this.modalCtrl.create({
      component: AyudaBoletaPage,
      cssClass: 'custom-alert-ayuda-modal', // Clase CSS personalizada
      backdropDismiss: false, // Opcional: evita que se cierre al hacer clic fuera del modal
    });

    await modal.present();
  }


  async navigateToPayments() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Métodos de Pago',  // Título del Action Sheet
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      cssClass: 'alert-apoyo-metodos-pagos',  // Clase CSS personalizada para el estilo
      buttons: [
        /*   {
             text: 'VisaLink',  // Opción para VisaLink
             icon: 'card',  // Icono para VisaLink (puedes elegir otro)
             handler: () => {
               console.log('VisaLink clicked');
               this.openVisaLink();  // Llama a tu función correspondiente
             },
           },*/
        {
          text: 'Depósito Bancario',  // Opción para Depósito Bancario
          icon: 'business',  // Icono para Depósito Bancario
          handler: () => {
            console.log('Depósito Bancario clicked');
           // this.mostrarDetallesCuenta();  // Llama a tu función correspondiente
          },
        },
        {
          text: 'Cancelar',  // Opción para Cancelar
          icon: 'close',  // Icono de cancelación
          role: 'cancel',  // Establece el rol de cancelación
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });

    // Presenta el action sheet
    await actionSheet.present();
    // Opcional: Log cuando el action sheet se haya cerrado
    const { role } = await actionSheet.onDidDismiss();
  }

  checkInput(field: keyof typeof this.formValidFields) {
    this.formValidFields[field] = this.paymentForm.get(field)?.value || '';
  }

  isFieldValid(field: keyof typeof this.formValidFields): boolean {
    return (this.formValidFields[field] || '').toString().trim().length > 0;
  }

  async getSaldoBloqueoViaje() {
    try {
      const datas = {
        id: this.user.idUser
      }
      this.driverService.desbloquear(datas).subscribe((re: any) => {
        return 0;
      })
    } catch (error) {
      console.error(error);
    }
  }

}
