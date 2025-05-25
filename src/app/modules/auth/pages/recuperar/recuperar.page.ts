import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage implements OnInit {
  recoverForm: FormGroup;

  constructor(private api: UserService, private fb: FormBuilder, private alertController: AlertController) {
    // Inicializar el formulario
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
  }

  async onSubmit() {
    if (this.recoverForm.valid) {
      const email = this.recoverForm.get('email')?.value

      // Aquí llamas al servicio para enviar el correo
        const data = {
          user: email
        }
        this.api.recover(data).subscribe(async (re) => {
      
          this.recoverForm.reset()
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Hemos enviado un enlace de recuperación a tu correo.',
            buttons: ['OK'],
          });
          await alert.present();
        }, async (error) => {
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'No pudimos encontrar una cuenta con ese correo.',
            buttons: ['OK'],
          });
          await alert.present();
        })

            
    }
  }

}
