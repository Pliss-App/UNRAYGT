import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.page.html',
  styleUrls: ['./offline.page.scss'],
})
export class OfflinePage implements OnInit {

  constructor(    private authService: AuthService, private networkService: ApiService, private router: Router) { }

  ngOnInit() {
  }

  reintentarConexion() {
    this.networkService.getFullConnectionStatus().subscribe(isConnected => {
     if (isConnected) {
        console.log("Conectado, no se recarga.");
        window.location.reload();
      } else {
        console.log("Desconectado, recargando...");
    
      } 
    });
  }

}
