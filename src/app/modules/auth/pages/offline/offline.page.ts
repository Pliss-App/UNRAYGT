import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/core/services/api.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.page.html',
  styleUrls: ['./offline.page.scss'],
})
export class OfflinePage implements OnInit {

  constructor(   private toastController: ToastController,   private authService: AuthService, private networkService: ApiService, private router: Router) { }

  ngOnInit() {
   
  }

  reintentarConexion() {
    this.networkService.getFullConnectionStatus().subscribe(isConnected => {
     if (isConnected) {
        console.log("Conectado, no se recarga.");
        window.location.reload();
      } else {
           this.mostrarError('No se pudo conectar. Verifica tu conexión o intenta más tarde.');
    
        console.log("Desconectado, recargando...");
    
      } 
    });
  }


    async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }

}
