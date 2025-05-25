import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.page.html',
  styleUrls: ['./formulario.page.scss'],
})
export class FormularioPage implements OnInit {

soporteForm: FormGroup;
  userRole: any;
  viajes: any[] = [];
  offset = 0;
  userId = 1; // ID del usuario autenticado
  role = "usuario"; // "usuario" o "conductor"
  user: any = null;

  constructor(private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private api: UserService,
    private auth: AuthService, private menuController: MenuController,
  ) {

    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
    this.soporteForm = this.formBuilder.group({
      idUser: [`${this.user.idUser}`],
      titulo: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
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


  async enviarSoporte() {
    if (this.soporteForm.invalid) return;

    const loading = await this.loadingController.create({
      message: 'Enviando mensaje...',
      spinner: 'crescent',
      duration: 2000
    });

    await loading.present();

    try {
      console.log(this.soporteForm.value)
      const response = this.api.insertNotaSoporteUsuario(this.soporteForm.value);
      response.subscribe(async () => {
        loading.dismiss();
        this.soporteForm.reset();

        const alert = await this.alertController.create({
          header: 'Mensaje Enviado',
          message: 'Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo.',
          buttons: ['OK']
        });

        await alert.present();
      })
    } catch (error) {
      console.error('❌ Ocurrió un error:', error);
    }
  }

  goBack() {
    this.navCtrl.back();
  }


}
