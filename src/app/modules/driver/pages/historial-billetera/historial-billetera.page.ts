import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-historial-billetera',
  templateUrl: './historial-billetera.page.html',
  styleUrls: ['./historial-billetera.page.scss'],
})
export class HistorialBilleteraPage implements OnInit {
   userRole: any;
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
