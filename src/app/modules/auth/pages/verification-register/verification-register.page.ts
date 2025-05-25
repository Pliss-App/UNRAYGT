import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonInput, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-verification-register',
  templateUrl: './verification-register.page.html',
  styleUrls: ['./verification-register.page.scss'],
})
export class VerificationRegisterPage implements OnInit {
  otpDigits: string[] = ['', '', '', '', '', ''];
  @ViewChildren('otpInput') otpInputs!: QueryList<IonInput>;
  otpArray = ['', '', '', '', '', ''];
  codigoIngresado: string = '';
  telefono: string = '';

  constructor(private route: ActivatedRoute, public toastController: ToastController,
    private api: UserService,
    private authService: AuthService,
    public alertController: AlertController,
    private router: Router) { }

  ngOnInit() {
    this.telefono = this.route.snapshot.paramMap.get('telefono')!;
    // this.presentToastWithOptions()
  }


  async verificarCodigo() {
    const data = {
      telefono: this.telefono,
      codigoIngreso: this.codigoIngresado
    }
    const res = await this.api.verificarCodigo(data);
    res.subscribe((re) => {
      if (re.success) {
        this.presentToast(re.success, re.msg);
        this.authService.refreshLogin(re);

        const data = {
          telefono: this.telefono
        }
        this.api.updateLogout(data).subscribe((re) => {
          window.location.reload();
        })
        // 🔄 Recarga la página al presionar "OK"
        //this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      } else {
        this.presentToast(re.success, re.msg);
      }
    })

  }

  resendOtp() {
    const data = {
      telefono: this.telefono,
      fecha: this.obtenerFechaHoraLocal()
    }
    try {
      const response = this.api.sendSMS(data);
      response.subscribe((re) => {
        if (re.success) {
          this.presentToast(re.success, re.msg);
        } else {
          this.presentToast(re.success, re.msg);
        }
      })
    } catch (error) {
      console.error(error)
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
    console.log('onDidDismiss resolved with role', role);
  }

  async presentToast(success: boolean, msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000,
      color: success ? 'success' : 'danger', // verde si true, rojo si false
      position: 'bottom', // puedes cambiarlo a 'top' o 'middle'
    });
    toast.present();
  }

}
