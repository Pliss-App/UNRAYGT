import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AlertController, IonInput, ToastController, LoadingController, MenuController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
//import { ApiService } from 'src/app/services/api.service';  // Asegúrate de tener el ApiService para las llamadas HTTP


@Component({
  selector: 'app-verificacion',
  templateUrl: './verificacion.page.html',
  styleUrls: ['./verificacion.page.scss'],
})
export class VerificacionPage implements OnInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<IonInput>;
  user: any;
  isLoading: boolean = false;
  response: any = {
    msg: '',
    result: null,
    success: null,
    token: '',
    user: {}

  }
  codigoIngresado: string = '';
  telefono: string = '';

  constructor(private authService: AuthService,

    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private menuController: MenuController, 
    private api: UserService,
    public toastController: ToastController, // Servicio para la API
    private alertController: AlertController
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.telefono = this.route.snapshot.paramMap.get('telefono')!;
  }

  async verificarCodigo() {
    this.isLoading = true;

    const loading = await this.loadingController.create({
      message: 'Validando código...',
      spinner: 'circles',
      translucent: true,

    });

    await loading.present();

    const start = Date.now(); // Marca inicio

    try {
      const data = {
        telefono: this.telefono,
        codigoIngreso: this.codigoIngresado
      };

      const response = await this.api.verificarCodigo(data).toPromise();
      if (response.success == true) {
        this.authService.refreshLogin(response);

        const data = {
          telefono: this.telefono
        }
        this.api.updateLogout(data).subscribe((re) => {
          const user = response.user;
          console.log("DATO ", user)
          // window.location.reload();
          if (user.rol == 'conductor') {
            window.location.replace('/driver/home');
          } else if (user.rol == 'usuario') {
            window.location.replace('/user/home');
          }
        })
      }

      else {
        this.presentToast(response.success, response.msg);
      }

    } catch (error) {
      console.error('Error en la verificación', error);
      this.isLoading = false;
      await loading.dismiss();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async resendOtp() {
    this.isLoading = true;

    const loading = await this.loadingController.create({
      message: 'Reenviando código...',
      spinner: 'circles',
      translucent: true
    });
    await loading.present();

    const start = Date.now(); // Marca inicio

    const data = {
      telefono: this.telefono,
      fecha: this.obtenerFechaHoraLocal()
    }
    try {
      const response = this.api.sendSMS(data);
      response.subscribe(async (re) => {

        const elapsed = Date.now() - start;
        const remainingTime = 2000 - elapsed;

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        await loading.dismiss();
        if (re.success) {
          this.isLoading = false;
          this.presentToast(re.success, re.msg);
        } else {
          this.isLoading = false;
          this.presentToast(re.success, re.msg);
        }
      })
    } catch (error) {
      console.error('Error en la verificación', error);
      this.isLoading = false;
      await loading.dismiss();
    }
    // Aquí llamarías a tu API para reenviar el OTP
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

  async presentAlert(message: any) {
    const alert = await this.alertController.create({
      header: 'Código enviado',
      subHeader: message,
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      header: 'Toast header',
      message: 'Click to Close',
      position: 'top',
      buttons: [
        {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await toast.present();

    const { role } = await toast.onDidDismiss();
  }

  async presentToast(success: boolean, msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 10000,
      color: success ? 'success' : 'danger', // verde si true, rojo si false
      position: 'bottom', // puedes cambiarlo a 'top' o 'middle'
    });
    toast.present();
  }

  onInputChange() {
    // Si quieres validar automáticamente al completar 4 dígitos:
    if (this.codigoIngresado.length === 4) {
      this.verificarCodigo();
    }
  }


  logout() {
    this.menuController.close();
    const data = {
      telefono: this.user.telefono
    }
    this.api.updateLogout(data).subscribe((re) => {
      this.authService.logout();
    })

  }

}
