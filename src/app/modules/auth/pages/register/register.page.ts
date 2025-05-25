import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { AlertregistroComponent } from 'src/app/shared/components/alertregistro/alertregistro.component';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  telefonooo: any = null
  registro!: FormGroup;
  error: any = null;
  isSubmitting: boolean = false;
  tieneCodigoReferido: boolean = false;
  codigoPais: any;
  valor: any;

  constructor(public toastController: ToastController,
    private auth: AuthService,
    private router: Router, private modalController: ModalController,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private api: UserService, public alertController: AlertController) { }

  async ngOnInit() {
    this.registro = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: [''],
      codigoPais: ['502', Validators.required],
      telefono: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      tieneCodigoReferido: [false],
      codigo: [''],
      fecha: [''],
      aceptaTerminos: [false, Validators.requiredTrue], // 👈 Importante
    }, { validator: this.passwordsMatchValidator });
  }

  async ionViewDidEnter() {
  }

  ionViewDidLoad() {
  }

  passwordsMatchValidator(formGroup: AbstractControl): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  isFieldInvalid(field: string): boolean {
    return (
      !!this.registro.get(field)?.invalid && !!this.registro.get(field)?.touched
    );
  }

  async onSubmit() {

    if (this.registro.invalid) {
      this.registro.markAllAsTouched(); // Para mostrar errores
      return;
    }

    this.registro.patchValue({ fecha: this.obtenerFechaHoraLocal() });
    if (this.registro.valid) {
      this.isSubmitting = true;
      // Muestra el loading
      const loading = await this.loadingController.create({
        message: 'Creando cuenta...',
        spinner: 'crescent', // Puedes cambiar el tipo de spinner aquí
        backdropDismiss: false, // Evita que el usuario cierre el loading manualmente
        cssClass: 'custom-loading',
      });
      await loading.present();
      try {
        const response = await this.api.createProfile(this.registro.value);
        response.subscribe((re) => {
          if (re.success == true) {
            this.router.navigate([`/auth/verification-register/${this.registro.value.telefono}`], { replaceUrl: true });
            this.isSubmitting = false;
            loading.dismiss();
            this.clearForm();
          } else if (re.success == false) {
            this.isSubmitting = false;
            loading.dismiss();
            this.error = re.msg;
            this.errorDuranteCreacion(this.error)
          }
        })
      } catch (error) {
        console.error("Error ", error);
        loading.dismiss();
      }
    } else {
      this.registro.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
    }
  }

  verfoto(){
    this.router.navigate([`/auth/verification-register/37300569`], { replaceUrl: true });
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


  clearForm() {
    this.registro.reset();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Cuenta Creada',
      subHeader: 'Te hemos enviado un código de verificación a tu correo. Inicia sesión y verifica tu cuenta.',
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      buttons: [

        {
          text: 'Verificar cuenta',
          handler: () => {
            // Aquí puedes agregar la lógica para redirigir a la pantalla de inicio de sesión
            //  console.log('Iniciar sesión clicked');
            this.router.navigateByUrl('/auth/login', { replaceUrl: true });
          }
        },
      ],
      cssClass: 'custom-alert'
    });

    await alert.present();
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

  async showErrorAlert(message: string) {
    const modal = await this.modalController.create({
      component: AlertregistroComponent,
      componentProps: { message },
      backdropDismiss: false, // Opcional: para que solo cierre con el botón
      cssClass: 'custom-transparent-modal'
    });
    await modal.present();
  }

}
