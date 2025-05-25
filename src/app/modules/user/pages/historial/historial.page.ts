import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  userRole: any;
  viajes: any[] = [];
  offset = 0;
  userId = 1; // ID del usuario autenticado
  role = "usuario"; // "usuario" o "conductor"
  user: any = null;

  constructor(private api: UserService, 
    private auth: AuthService, private menuController: MenuController,  
    private navCtrl: NavController) {
    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
   }

  ngOnInit() {
    this.loadViajes();
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir
   
    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  loadViajes(event?: InfiniteScrollCustomEvent) {
    try {
        this.api.getHistorial(this.user.idUser, this.userRole, this.offset).subscribe((re)=>{
          console.log(re)
          var data = re.result;
          this.viajes = [...this.viajes, ...re.result]; // Agrega más viajes
          this.offset += 10; // Aumenta el offset
  
          if (event) event.target.complete(); // Detiene el loader
        })
    } catch (error) {
      console.error(error)
    }
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    this.loadViajes(event);
  }

  goBack() {
    this.navCtrl.back();
}

}
