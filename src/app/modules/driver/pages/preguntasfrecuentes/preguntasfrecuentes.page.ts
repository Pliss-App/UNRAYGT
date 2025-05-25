import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-preguntasfrecuentes',
  templateUrl: './preguntasfrecuentes.page.html',
  styleUrls: ['./preguntasfrecuentes.page.scss'],
})
export class PreguntasfrecuentesPage implements OnInit {

  userRole: any;
  user: any = null;
  preguntas: any = [];

  constructor(private api: UserService,
    private auth: AuthService, private menuController: MenuController,
    private navCtrl: NavController, private alertController: AlertController) {
    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
  }

  ngOnInit() {
    this.getPreguntasFrecuentes();
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }


  async getPreguntasFrecuentes() {
    try {
      const response = await this.api.getPreguntasFrecuentes('conductor').toPromise();
      if (response.success == true) {
        console.log("LISTAOD E PREGUTNAS ", response);
        this.preguntas = response.result;
      }
    } catch (error) {
      console.error(error);
    }
  }


  goBack() {
    this.navCtrl.back();
  }
}
