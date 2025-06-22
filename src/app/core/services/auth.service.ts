import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { LocationService } from './location.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService { //'https://unrayappserver.onrender.com/api';  
  private authUrl = `${environment.url}/api`;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;


  constructor(  private location: Location, private http: HttpClient, private router: Router, private alertController: AlertController) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')!));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  isWeb(): boolean {
    return !Capacitor.isNativePlatform();
  }



  // Método para iniciar sesión y guardar datos del usuario
  login(credenciales: any) {
    return this.http.post<any>(`${this.authUrl}/user/login`, credenciales)
      .pipe(map(async user => {

        if (user?.msg) {
          if (user && user.token) {
            localStorage.setItem('currentUser', JSON.stringify(user.user));
            this.currentUserSubject.next(user.user);
            if (user.user.rol === 'usuario') {
              this.router.navigateByUrl('/user').then(() => {
                window.location.reload(); // Recarga completa de la app para ejecutar inicialización
              });
            } else if (user.user.rol === 'conductor') {
              this.router.navigateByUrl('/driver').then(() => {
                window.location.reload(); // Recarga completa de la app para ejecutar inicialización
              });
            }
          }
          return user.user;
        } else {
          var error: any = this.getFirstFiveLetters(user);

          // Mostrar alerta al usuario en caso de error
          const alert = await this.alertController.create({
            header: 'Error de Inicio de Sesión',
            message: 'Usuario o contraseña incorrectos. Por favor, intenta nuevamente.',
            buttons: ['OK']
          });
          await alert.present();
          throw error; // Relanzar el error si es necesario
        }

      }),

        catchError(async (error) => {
          // Mostrar alerta al usuario en caso de error
          const alert = await this.alertController.create({
            header: 'Error de Inicio de Sesión',
            message: 'Usuario o contraseña incorrectos. Por favor, intenta nuevamente.',
            buttons: ['OK']
          });
          await alert.present();
          throw error; // Relanzar el error si es necesario
        }))
  }


  loginTelefono(credenciales: any) {
    return this.http.post<any>(`${this.authUrl}/cuenta/login-register`, credenciales)
      .pipe(map(async user => {
        if (user?.msg) {
          if (user && user.token) {
            localStorage.setItem('currentUser', JSON.stringify(user.user));
            this.currentUserSubject.next(user.user);
            const verificacion = user.user;
            if (verificacion.verificacion == 1) {
              if (user.user.rol === 'usuario') {
                this.router.navigateByUrl('/user').then(() => {
                  // window.location.reload(); // Recarga completa de la app para ejecutar inicialización
                });
              } else if (user.user.rol === 'conductor') {
                this.router.navigateByUrl('/driver').then(() => {
                  //  window.location.reload(); // Recarga completa de la app para ejecutar inicialización
                });
              }
            } else {
                 this.router.navigate([`/auth/verificacion/${verificacion.telefono}`], { replaceUrl: true });
            }
          }
          return user.user;
        } else {
          var error: any = this.getFirstFiveLetters(user);

          // Mostrar alerta al usuario en caso de error
          const alert = await this.alertController.create({
            header: 'Error de Inicio de Sesión',
            message: 'Usuario o contraseña incorrectos. Por favor, intenta nuevamente.',
            buttons: ['OK']
          });
          await alert.present();
          throw error; // Relanzar el error si es necesario
        }
      }))
  }


  loginModo(credenciales: any) {
    return this.http.post<any>(`${this.authUrl}/cuenta/login-modo`, credenciales)
      .pipe(map(async user => {

        if (user?.msg) {
          if (user && user.token) {
            localStorage.setItem('currentUser', JSON.stringify(user.user));
            this.currentUserSubject.next(user.user);
            if (user.user.rol === 'usuario') {
              this.router.navigateByUrl('/user').then(() => {
                window.location.reload(); // Recarga completa de la app para ejecutar inicialización
              });
            } else if (user.user.rol === 'conductor') {
              this.router.navigateByUrl('/driver').then(() => {
                window.location.reload(); // Recarga completa de la app para ejecutar inicialización
              });
            }
          }
          return user.user;
        } else {
          var error: any = this.getFirstFiveLetters(user);

          // Mostrar alerta al usuario en caso de error
          const alert = await this.alertController.create({
            header: 'Error de Inicio de Sesión',
            message: 'Usuario o contraseña incorrectos. Por favor, intenta nuevamente.',
            buttons: ['OK']
          });
          await alert.present();
          throw error; // Relanzar el error si es necesario
        }
      }))
  }

  refreshLogin(user: any) {
    if (user && user.token) {
      localStorage.setItem('currentUser', JSON.stringify(user.user));
      this.currentUserSubject.next(user.user);
    }
  }

  // Método para cerrar sesión
  logout() {


    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    /*   this.router.navigate(['/auth/login']);
       // Redirige a la página de autenticación y fuerza la recarga
       this.router.navigateByUrl('/auth').then(() => {
         window.location.reload(); // Recarga completa de la app para ejecutar inicialización
       });
   */

    this.router.navigate(['/auth/formtelefono'], { replaceUrl: true }).then(() => {
      this.location.go('/auth/formtelefono');
      window.location.reload();
    })
  }
/*
  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  } */

  async isAuthenticated(): Promise<boolean> {
  if (!this.currentUserSubject.value) {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }
  return !!this.currentUserSubject.value;
}

  isLoggedIn(): boolean {
    // Verifica el estado de autenticación del usuario
    return !!localStorage.getItem('currentUser'); // Cambia esto según la lógica de tu aplicación
  }

  // Método para obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener el rol del usuario
  getRole(): string {
    return this.currentUserSubject.value?.rol || 'guest';
  }

  // Obtener el rol del usuario
  getUser(): string {
    return this.currentUserSubject.value || null;
  }

  getFirstFiveLetters(text: string): string {
    if (!text) {
      return '';
    }
    return text.substring(0, 5);
  }

}
