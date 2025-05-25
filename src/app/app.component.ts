import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { IonRouterOutlet } from '@ionic/angular';
import { UserService } from './core/services/user.service';
import { LocationService } from './core/services/location.service';
import { SolicitudService } from './core/services/solicitud.service';
import { OnesignalService } from './core/services/onesignal.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(IonRouterOutlet) routerOutlet?: IonRouterOutlet;
  user: any = null;
  rating: any = null;
  stars: string[] = [];
  watch: any = null;
  role: any = null;
  constructor(
    private location: LocationService,
    private soli: SolicitudService,
    private menuCtrl: MenuController,
    private platform: Platform,
    private authService: AuthService,
    private api: UserService,
    private router: Router) {
  }

  async ngAfterViewInit() {
    // Espera un pequeño tiempo para asegurarse que Capacitor cargó bien
    setTimeout(() => {
      this.verificarPermisosGeolocalizacion();
    }, 500); // 100ms o más si el error persiste
  }

  async verificarPermisosGeolocalizacion() {
    try {
      const permission = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        const newPerm = await Geolocation.requestPermissions();
        if (newPerm.location !== 'granted') {
          this.router.navigate(['/auth/permissionlocation']);
          return;
        }
      }

     
      await this.initializeApp();

    } catch (error) {
      console.error('Error revisando o solicitando permisos:', error);
      this.router.navigate(['/auth/permissionlocation']);
    }
  }


  async ngOnInit() {
    await this.platform.ready();
    await this.getSplash();

    App.addListener('pause', () => {
      this.saveState();
    });

    App.addListener('resume', () => {
      this.restoreState();
    });
  }
  /*
    async ngOnInit() {
  
      this.platform.ready().then(async () => {
      await this.getSplash();
        try {
          let permission = await Geolocation.checkPermissions();
  
          if (permission.location !== 'granted') {
            permission = await Geolocation.requestPermissions(); // <-- importante
          }
  
          if (permission.location === 'granted') {
            await this.location.init();
            await this.initializeApp();
          } else {
            this.router.navigate(['/auth/permissionlocation']);
          }
        } catch (error) {
          console.error('Error revisando o solicitando permisos:', error);
          this.router.navigate(['/auth/permissionlocation']);
        }
  
  
      });
  
      App.addListener('pause', () => {
        this.saveState();  // Guardar estado cuando se minimiza
      });
  
      App.addListener('resume', () => {
        this.restoreState();  // Restaurar estado cuando se reanuda
      });
    } */

  async getSplash() {
    await SplashScreen.show({
      autoHide: true,
      showDuration: 3000
    })

  }

  async initializeApp() {

    const isAuthenticated = this.authService.isAuthenticated();
    const currentUrl = this.router.url;
    if (isAuthenticated) {
       await this.location.init();
      this.user = this.authService.getUser();
      const userRole = this.authService.getRole();
      this.role = userRole;
      this.getRating()
      // Solo redirige al módulo principal si el usuario no está ya en una ruta interna válida
      if (userRole === 'usuario' && !currentUrl.startsWith('/user')) {

          if (this.user.nombre == "" && this.user.apellido == "") {

            this.router.navigate(['/auth/formnombres'], { replaceUrl: true });
          } else {

            this.menuCtrl.enable(true, 'userMenu');
            this.menuCtrl.enable(false, 'driverMenu');

            this.soli.startPolling();
            this.router.navigate(['/user'], { replaceUrl: true });
          }
      
        //  this.initializeGeolocation();
      } else if (userRole === 'conductor' && !currentUrl.startsWith('/driver')) {
        //  this.getRating()
          this.soli.startPolling();
          this.menuCtrl.enable(true, 'driverMenu');
          this.menuCtrl.enable(false, 'userMenu');
          this.router.navigate(['/driver'], { replaceUrl: true });
      }

    } else {
      this.menuCtrl.enable(false, 'userMenu');
      this.menuCtrl.enable(false, 'driverMenu');
      // Redirige a la autenticación si no está autenticad
      this.router.navigate(['/auth'], { replaceUrl: true });
    }


  }


  async getRating() {
    try {
      await this.api.getRating(this.user.idUser).subscribe((re) => {
        if (re.msg == 'SUCCESSFULLY') {
          this.rating = re.result;
          this.updateStars(this.rating.rating);
          return 0;
        } else {
          return 1;
        }
      })
    } catch (error) {
      console.log("error consultando Rating")
    }

  }


  updateStars(valor: number) {
    this.stars = Array(5)
      .fill('star-outline')
      .map((_, i) => {
        if (i < Math.floor(valor)) {
          return 'star'; // Estrella llena
        } else if (i < valor) {
          return 'star-half'; // Estrella a la mitad
        } else {
          return 'star-outline'; // Estrella vacía
        }
      });
  }
  logout() {
    this.menuCtrl.close();
    this.authService.logout();

  }



  closeMenu(item: any) {
    if (item == 'viajar') {
      window.location.replace('/user/home');
    } else if (item == 'inicio') {
      window.location.replace('/driver/home');
    }

    this.menuCtrl.close();
  }


  async saveState() {
    const currentRoute = this.router.url;  // Obtiene la URL actual
    await Preferences.set({ key: 'lastRoute', value: currentRoute });
  }

  async restoreState() {
    const { value } = await Preferences.get({ key: 'lastRoute' });
    if (value) {
      this.router.navigateByUrl(value);  // Navega a la última vista guardada
    }
  }

  async cambiarModo(item: any) {

    if (item == 'usuario') {
      this.router.navigate([`/user/cambiarmodo/${this.user.idUser}`]);
    } else {
      const data = {
        telefono: this.user.telefono
      }

      const rol = {
        idUser: this.user.idUser,
        rol: 1,
        idService: 5
      }
      const res = await this.api.updateRolModo(rol).toPromise();

      if (res.success === true) {
        const response = await this.authService.loginModo(data).toPromise();

      }
    }
    this.menuCtrl.close();
  }

}
