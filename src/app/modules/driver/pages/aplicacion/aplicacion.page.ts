import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-aplicacion',
  templateUrl: './aplicacion.page.html',
  styleUrls: ['./aplicacion.page.scss'],
})
export class AplicacionPage implements OnInit {
  userRole: any;
  user: any = null;
  appVersion: string = 'Cargando...';

  constructor(private api: UserService,public toastController: ToastController,private platform: Platform,
    private auth: AuthService, private menuController: MenuController, private loadingCtrl: LoadingController,
    private navCtrl: NavController, private alertController: AlertController) {
    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
  }

  async ngOnInit() {
    if (this.platform.is('capacitor')) { // Solo ejecuta si está en Android o iOS
      try {
        const info = await App.getInfo();
        this.appVersion = `${info.version} (build ${info.build})`;
      } catch (error) {
        console.error('Error obteniendo la versión:', error);
        this.appVersion = 'No disponible';
      }
    } else {
      console.warn('App ejecutándose en la web. No se puede obtener la versión.');
      this.appVersion = 'Versión Web';
    }
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }


  goBack() {
    this.navCtrl.back();
  }

}
