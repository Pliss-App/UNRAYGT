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

@Component({
  selector: 'app-recargar-billetera',
  templateUrl: './recargar-billetera.page.html',
  styleUrls: ['./recargar-billetera.page.scss'],
})

export class RecargarBilleteraPage implements OnInit {
  paymentForm: FormGroup;
  photoBase64: any = null;
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

  constructor(private iab: InAppBrowser, private api: UserService, private auth: AuthService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,public actionSheetController: ActionSheetController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {
    this.user = this.auth.getUser();
    this.paymentForm = this.fb.group({
      receiptNumber: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    });
 
  }
  async ngOnInit(): Promise<void> {
    // throw new Error('Method not implemented.');

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
      buttons: [
        {
          text: 'Tomar Foto',
          handler: () => this.captureImage(),
        },
        {
          text: 'Cargar desde Galería',
          handler: () => this.selectImage(),
        },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await alert.present();
  }



  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,// Devuelve la imagen en base64 
      source: CameraSource.Camera // Abre la cámara directamente
    });
    //   this.imageBase64 = `data:image/jpeg;base64,${image.base64String}`;
    // const imageData = image.dataUrl ?? '';
    this.photoBase64 = `data:image/jpeg;base64,${image.base64String}`;
    if (this.photoBase64) {
      await this.mostrarLoading('Validando imagen. Puede llevar un tiempo...');  // Mostrar loading
      this.extractTextFromImage(this.photoBase64);
    }

  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,// Devuelve la imagen en base64
      source: CameraSource.Photos // Abre la cámara directamente
    });
    // const base64Image = image.dataUrl;
    //const imageData = image.dataUrl ?? '';
    this.photoBase64 = `data:image/jpeg;base64,${image.base64String}`;
    if (this.photoBase64) {
      await this.mostrarLoading('Validando imagen. Puede llevar un tiempo...');  // Mostrar loading
      this.extractTextFromImage(this.photoBase64);
    }
  }

  async submitForm() {
    if (!this.paymentForm.valid || !this.photoBase64) {
      this.showAlert('Validación', 'Por favor, completa todos los campos y carga tu vaucher o boleta.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando datos...',
    });
    await loading.present();

    // Simulación de API
    setTimeout(async () => {
      this.isImageValid = false;
      try {
        var data = {
          iduser: this.user.idUser,
          boleta: this.paymentForm.value.receiptNumber,
          monto: this.paymentForm.value.amount,
          url: this.photoBase64
        };
        this.api.recargarBilletara(data).subscribe((re) => {
          if (re?.msg) {

            this.showAlert('Éxito', 'Datos enviados correctamente.');
            this.resetForm();
            loading.dismiss();
          } else {
            this.isImageValid = true;
            loading.dismiss();
            this.showAlert('Error', 'Hubo un problema al enviar los datos.');
          }
        })
      } catch (error) {
        this.isImageValid = true;
        loading.dismiss();
        this.showAlert('Error', 'Hubo un problema al enviar los datos.');
      }

      //    const success = Math.random() > 0.5; // Simula éxito o error

      /*  if (success) {
          this.showAlert('Éxito', 'Datos enviados correctamente.');
          this.resetForm();
        } else {
          this.showAlert('Error', 'Hubo un problema al enviar los datos.');
        } */
    }, 2000);
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
      cssClass: 'custom-alert-billetera', // Aplica estilos personalizados
    });
    await alert.present();
  }

  async extractTextFromImage(image: string) {
    try {
      const { data } = await Tesseract.recognize(image, 'eng'); // OCR en inglés       
      this.extractedText = data.text;
      console.log(this.extractedText)
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
        this.mostrarAlerta('Error', 'La imagen no es válida.');
      }

    } catch (error) {
      console.error('Error en OCR:', error);
      // Mostrar alerta en caso de error
      this.mostrarAlerta('Error', 'Hubo un problema al procesar la imagen.');

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
      this.mostrarAlerta('Imagen Válida', '¡Tu imagen es válida!');
    } else {
      this.isImageValid = false;
      this.mostrarAlerta('Imagen Inválida', 'Parece que la imagen no cumple con los parámetros de boleta o transferencia bancaria.');
    }

    // Cerrar el loading después de la validación
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  validateBankInText(text: string): boolean {
    // Convertir el texto a minúsculas para hacer una búsqueda insensible al caso
    const lowerCaseText = text.toLowerCase();

    // Recorrer todos los bancos de la lista y verificar si el texto contiene alguno de ellos
    for (let bank of this.guatemalaBanks) {
      if (lowerCaseText.includes(bank.toLowerCase())) {
        return true;  // Se encontró un banco en el texto
      }
    }

    return false;  // No se encontró ningún banco
  }

  // Método para mostrar un alert
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
      cssClass: 'custom-alert-imagen', // Aquí agregamos una clase personalizada
    });

    await alert.present();
  }


  // Método para mostrar un loading
  async mostrarLoading(message: string) {
    this.loading = await this.loadingCtrl.create({
      message: message,
      spinner: 'crescent',  // Puedes cambiar el spinner si lo deseas
    });
    await this.loading.present();
  }

  async mostrarDetallesCuenta() {
    const modal = await this.modalCtrl.create({
      component: DetallesCuentaPage,
      cssClass: 'custom-alert-modal', // Clase CSS personalizada
      backdropDismiss: false, // Opcional: evita que se cierre al hacer clic fuera del modal
    });

    await modal.present();
  }


  async navigateToPayments() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Métodos de Pago',  // Título del Action Sheet
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      cssClass: 'alert-metodos-pagos',  // Clase CSS personalizada para el estilo
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
            this.mostrarDetallesCuenta();  // Llama a tu función correspondiente
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
    console.log('onDidDismiss resolved with role', role);
  }
  
  checkInput(field: keyof typeof this.formValidFields) {
    this.formValidFields[field] = this.paymentForm.get(field)?.value || '';
  }

  isFieldValid(field: keyof typeof this.formValidFields): boolean {
    return (this.formValidFields[field] || '').toString().trim().length > 0;
  }

}
