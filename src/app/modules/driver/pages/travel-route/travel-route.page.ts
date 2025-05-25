import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SolicitudService } from 'src/app/core/services/solicitud.service';
import { UserService } from 'src/app/core/services/user.service';
import { Geolocation } from '@capacitor/geolocation';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-travel-route',
  templateUrl: './travel-route.page.html',
  styleUrls: ['./travel-route.page.scss'],
})
export class TravelRoutePage implements OnInit {
  solicitud: any;
  idUser: string = '';
  user: any;
  idConductor: string = '';
  private intervalId: any;
  sheetHeight = 150; // Altura inicial
  constructor(
    private router: Router, 
    private shared: SharedService, 
    private loadingCtrl: LoadingController,
    private soli: SolicitudService, 
    private sharedDataService: SharedService,
    private api: UserService, 
    private auth: AuthService) {

    this.user = this.auth.getUser();
  }

  ngOnInit() {
    this.startPolling();
  }

  async startPolling() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
      spinner: 'crescent', // Opciones: 'bubbles', 'dots', 'circles', 'crescent', 'lines'
    });
    await loading.present();
 
    try {
    this.shared.getValVia.subscribe((response) => {
      if (response?.success) {
        this.solicitud = response.result;
        this.idConductor = this.solicitud.idConductor;
      } else {
        this.getDestroyInterval();
        this.soli.resumePollingOnTripEnd();
        // this.cleanupAndRedirect();
      }
    })


    this.intervalId = setInterval(async () => {
      const timestamp = new Date().getTime();
      this.api.checkActiveTravel(this.user.idUser, timestamp).subscribe((response) => {
        if (response?.success) {
          this.solicitud = response.result;
          this.idConductor = this.solicitud.idConductor;
        } else {
          this.getDestroyInterval();
          this.soli.resumePollingOnTripEnd();
          // this.cleanupAndRedirect();
        }
      });
 
    }, 1500)
    await loading.dismiss();
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    // 3️⃣ Ocultar el Loading cuando termine de cargar
    await loading.dismiss();
  }
  }


  getDestroyInterval() {
    // Limpia el intervalo al salir de la vista
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async locate() {
    const coordinates = await Geolocation.getCurrentPosition();
    const coords = {
      lat: coordinates.coords.latitude, lon: coordinates.coords.longitude,
      heading: coordinates.coords.heading
    };

    const data = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude, direction: 'salida', address: '' };

    //   this.showAlert('📍 Ubicación obtenida', `Lat: ${coords.lat}, Lng: ${coords.lon}`);
    this.sharedDataService.setData(data);

  }

  actualizarAlturaMapa(nuevaAltura: number) {
    this.sheetHeight = nuevaAltura;
    this.forceMapResize();
  }

  forceMapResize() {
    setTimeout(() => {
      google.maps.event.trigger(window, 'resize');
    }, 50); // Pequeño retraso para evitar flickering
  }

  ngOnDestroy(): void {
    this.getDestroyInterval();
  }
}
