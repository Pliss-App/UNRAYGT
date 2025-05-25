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
  hasMore: boolean = true;
  userRole: any;
   viajes: any[] = [];
   offset = 0;
   userId = 1; // ID del usuario autenticado
   role = "usuario"; // "usuario" o "conductor"
   user: any = null;
 
   constructor(private api: UserService, 
    private auth: AuthService, 
    private menuController: MenuController,  
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
      this.api.getHistorial(this.user.idUser, this.userRole, this.offset).subscribe((re) => {
      
  
        if (re.success !== false) {
          var data = re.result;
  
          if (data.length > 0) {
            this.viajes = [...this.viajes, ...data]; // Agrega más viajes
            this.offset += 10; // Aumenta el offset
          } else {
            this.hasMore = false; // No hay más viajes
          }
  
          if (event) event.target.complete(); // Detiene el loader
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
 
   loadMore(event: InfiniteScrollCustomEvent) {
    if (this.hasMore) {
      this.loadViajes(event);
    } else {
      event.target.disabled = true; // Deshabilita la carga infinita
    }
  }
 
   goBack() {
     this.navCtrl.back();
 }
}
