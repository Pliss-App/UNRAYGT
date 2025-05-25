import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.page.html',
  styleUrls: ['./ayuda.page.scss'],
})
export class AyudaPage implements OnInit {

   userRole: any;
   viajes: any[] = [];
   offset = 0;
   userId = 1; // ID del usuario autenticado
   role = "usuario"; // "usuario" o "conductor"
   user: any = null;
 
   constructor(private api: UserService,
     private auth: AuthService, private menuController: MenuController,
     private navCtrl: NavController ,private alertController: AlertController) {
 
     this.userRole = this.auth.getRole();
     this.user = this.auth.getUser();
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


}
