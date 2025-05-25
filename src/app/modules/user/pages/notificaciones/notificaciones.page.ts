import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {

 user: any = {}
   isLoading = false;
   fecha: any = null;
   notificaciones: any = [];
 
   notificacionesFiltradas: any = [];
   filtroEstado = 'todas';
   busqueda = '';
 
   constructor(private navCtrl: NavController, private api: UserService, private auth: AuthService,) {
     this.user = this.auth.getUser();
   }
 
   ngOnInit() {
     this.getNotificaciones();
 
   }
 
 
   getNotificaciones() {
     this.isLoading = true;
     try {
       this.api.getNotificacionesUser(this.user.idUser).subscribe((re) => {
         if (re.success) {
           this.notificaciones = re.result;
           this.filtrarNotificaciones()
           this.isLoading = false;
         }
       })
     } catch (error) {
       this.isLoading = false;
     }
 
   }
 
 
   filtrarNotificaciones() {
     this.notificacionesFiltradas = this.notificaciones.filter((noti: any) => {
       const cumpleFiltro =
         this.filtroEstado === 'todas' ||
         (this.filtroEstado === 'enviada' && noti.estado === 'enviada') ||
         (this.filtroEstado === 'vista' && noti.estado === 'vista');
 
       const cumpleBusqueda = this.busqueda === '' || noti.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) || noti.mensaje.toLowerCase().includes(this.busqueda.toLowerCase());
 
       return cumpleFiltro && cumpleBusqueda;
     });
   }
 
   async marcarComoVista(notificacion: any) {
 
     try {
       const data = {
         id: this.user.idUser,
         idVista: notificacion.id,
         fecha: this.obtenerFechaHoraLocal()
       }
       const response = await this.api.updatetNotificacion(data).toPromise();
       if (response.success) {
         notificacion.estado = 'vista';
         this.filtrarNotificaciones();
         return;
       }
     } catch (error) {
       console.error(error);
       this.isLoading = false;
     }
   }
 
   calcularTiempoRelativo(fecha: string) {
     const tiempo = new Date(fecha);
     const ahora = new Date();
     const diferencia = Math.floor((ahora.getTime() - tiempo.getTime()) / 1000); // En segundos
 
     if (diferencia < 60) return 'Hace unos segundos';
     if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`;
     if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} horas`;
     return `Hace ${Math.floor(diferencia / 86400)} días`;
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
 
   back() {
     this.navCtrl.navigateRoot('/user', { replaceUrl: true });
   }
 

}
