import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { interval, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Share } from '@capacitor/share';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SolicitudService } from 'src/app/core/services/solicitud.service';
import { UserService } from 'src/app/core/services/user.service';
import { Platform } from '@ionic/angular';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');



@Component({
  selector: 'app-travel-route',
  templateUrl: './travel-route.page.html',
  styleUrls: ['./travel-route.page.scss'],
})
export class TravelRoutePage implements OnInit {
  isSharingLocation: boolean = false;
  user: any;
  solicitud: any;
  sheetHeight = 150; // Altura inicial
  idUser: string = '';
  idConductor: string = '';
  points: any = [];
  estados: any = null;
  private pollingSubscription: any;
  private intervalId: any;
  watch: any = null;

  loading: any;

  constructor(private router: Router,
    private shared: SharedService,
    private soli: SolicitudService,
    private loadingCtrl: LoadingController,
    private api: UserService,
    private platform: Platform,
    private auth: AuthService,) {

    this.user = this.auth.getUser();

    console.log("Entro a cargar soliciud")

  }

  ngOnInit() {
    console.log("Entro a cargar soliciud w")
    this.startPolling();
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

  async startPolling() {

    this.loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
      spinner: 'crescent', // Opciones: 'bubbles', 'dots', 'circles', 'crescent', 'lines'
    });
    await this.loading.present();

    try {

      const timestamp = new Date().getTime();
      this.api.checkActiveTravel(this.user.idUser, timestamp).subscribe((response) => {
        console.log("DATOS DEL VIAJE ", response)
        if (response?.success) {

          this.solicitud = response.result;
          this.idConductor = this.solicitud.idConductor;
          var detVia = {

          }
          this.shared.kmRecorridos(detVia);
        }
      });
      //
      this.intervalId = setInterval(() => {
        const timestamp = new Date().getTime();
        this.api.checkActiveTravel(this.user.idUser, timestamp).subscribe((response) => {
          if (response?.success) {
            this.solicitud = response.result;
            this.idConductor = this.solicitud.idConductor;

          } else {
            this.getDestroyInterval();
            this.soli.resumePollingOnTripEnd();
          }
        });
      }, 2000);
      // Asegúrate de que el loading se mantenga por al menos 3 segundos
      setTimeout(async () => {
        // Aquí ya puedes cerrar el loading después de al menos 3 segundos
        await this.loading.dismiss();
      }, 3000); // 3000 ms = 3 segundos

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      // 3️⃣ Ocultar el Loading cuando termine de cargar
      await this.loading.dismiss();
    }
  }

  cleanupAndRedirect() {
    // Opcional: Limpia variables o servicios si es necesario
    this.solicitud = null;
    this.idConductor = "";

    // Redirige a la página principal eliminando el historial
    this.router.navigate(['/user'], { replaceUrl: true });
    // this.router.navigate(['/pagina-principal'], { replaceUrl: true });
  }
  finalizarViaje() {
    // Lógica para finalizar el viaje
    this.soli.resumePollingOnTripEnd();
  }



  getDestroyInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async initializeGeolocation() {
    this.platform.ready().then(async () => {
      if (this.platform.is('cordova') || this.platform.is('capacitor')) {
        try {
          if (!this.isSharingLocation) {
            const url = `https://unraylatinoamerica.com/location/ubicacion?id=${this.user.idUser}`;
            // Aquí puedes enviar la ubicación a tu backend

            await Share.share({
              title: '🚩 Ubicación en tiempo real',
              text: '📍 Haz clic para ver mi ubicación en tiempo real',
              url: url,
              dialogTitle: 'Compartir ubicación'
            });
            this.watch = await BackgroundGeolocation.addWatcher(
              {
                requestPermissions: true,
                stale: false,
                backgroundMessage: 'Compartiendo Ubicación',
                distanceFilter: 10,
              },
              async (result, error) => {
                if (error) {
                  console.error('Error obteniendo ubicación:', error);
                  return;
                }

                if (result) {
                  let data = {
                    id: this.user.idUser,
                    lat: result.latitude,
                    lng: result.longitude,
                    angle: result.bearing || 0
                  }


                  const response = this.api.updateLocationUser(data).toPromise();
                  response.then((re) => {

                    let shared = {
                      id: this.user.idUser,
                      isShared: 1
                    }
                    const res = this.api.updateLocationUserisShared(shared).toPromise();
                    res.then((re) => {
                      var resp = re;
                    })
                  })

                }
              }
            );
            this.isSharingLocation = true; // Ahora estamos compartiendo
          } else {
            this.detener();
          }

        } catch (err) {
          console.warn('Error general al iniciar seguimiento de ubicación:', err);
          // Continúa sin detener la app
        }
      } else {
        console.log('Esta función solo está disponible en dispositivos móviles reales.');
      }
    });
  }

  async detener() {

    await BackgroundGeolocation.removeWatcher({ id: this.watch });
    this.isSharingLocation = false; // Ya no estamos compartiendo   
    let shared = {
      id: this.user.idUser,
      isShared: 0
    }
    const res = this.api.updateLocationUserisShared(shared).toPromise();
    res.then((re) => {
      var resp = re;
    })

    console.log('Se dejó de compartir ubicación.');
  }

  ngOnDestroy(): void {
    this.getDestroyInterval();
  }

}
