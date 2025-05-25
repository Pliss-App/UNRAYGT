import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = `${environment.url}/api`; //'https://unrayappserver.onrender.com/api';
  private isConnected = new BehaviorSubject<boolean>(true); // Estado de conexión
  private reconnecting = false;  // Para evitar reintentos simultáneos
  private isApiConnected = new BehaviorSubject<boolean>(false); // Estado de conexión a la API
  private reloaded = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
    this.checkNetworkStatus();
    this.startApiMonitoring();


  }

  // Configuración de encabezados
  private getHeaders() {
    const token = JSON.parse(localStorage.getItem('currentUser')!)?.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Método para obtener datos
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders() });
  }

  // Método para enviar datos
  post(endpoint: string, data: any): Observable<any> {

    return this.http.post(`${this.apiUrl}/${endpoint}`, data, { headers: this.getHeaders() });
  }

  // Método para actualizar datos
  put(endpoint: string, data: any): Observable<any> {

    return this.http.put(`${this.apiUrl}/${endpoint}`, data, { headers: this.getHeaders() });
  }

  // Método para eliminar datos
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders() });
  }

  //Esto es solo para mensajes del chat 
  sendChat(endpoint: string, data: any) {
    return this.http.post(`${this.apiUrl}/${endpoint}`, data);
  }

  getChat( endpoint: string, idViaje: string, emisor_id: number, receptor_id: number) {
    return this.http.get(`${this.apiUrl}/${endpoint}`, {
      params: {idViaje:idViaje, emisor_id: emisor_id, receptor_id: receptor_id },
    });
  }
  // Detectar cambios en la red
  private async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isConnected.next(status.connected); // Inicializar estado de red

    // Monitorear cambios en la red (conexión/desconexión)
    Network.addListener('networkStatusChange', (status) => {
      this.isConnected.next(status.connected);
      if (status.connected) {
        this.tryReconnect(); // Intentar reconectar si hay red
      } else {
        this.handleDisconnection(); // Manejar desconexión
      }
    });
  }

  // Verificar la API cada 3 segundos
  private startApiMonitoring() {
    interval(3000).pipe(
      debounceTime(1000), // Añadimos debounce para no hacer peticiones excesivas
      distinctUntilChanged() // Evitamos peticiones repetidas
    ).subscribe(() => {
      if (this.isConnected.value && !this.reconnecting) {
        this.reconnecting = true; // Evitar reintentos simultáneos
        this.http.get(this.apiUrl + '/init/conection').pipe(
          catchError(() => {
            this.isApiConnected.next(false);
            this.reconnecting = false;
            this.handleDisconnection(); // No hay conexión con la API
            throw 'API no disponible';
          })
        ).subscribe(() => {
          this.isApiConnected.next(true);
          this.reconnecting = false;

          const isAuthenticated = this.authService.isAuthenticated();
          const userRole = this.authService.getRole();
          const currentUrl = this.router.url;
          if (isAuthenticated) {
            if (userRole === 'usuario' && !currentUrl.startsWith('/user')) {
              // this.router.navigate(['/user'], { replaceUrl: true });
            } else {
              // this.router.navigate(['/driver'], { replaceUrl: true });
            }
          }
        });
      }
    });
  }

  // Acción cuando se pierde la conexión
  private handleDisconnection() {
    this.router.navigate(['/auth/offline']); // Redirigir a la vista offline
  }

  // Intentar reconectar cuando la red se recupere
  private tryReconnect() {
    if (!this.reconnecting && this.isConnected.value) {
      console.log('Intentando reconectar...');
      this.startApiMonitoring(); // Comienza a monitorear la API nuevamente
    }
  }

  // Obtener el estado de conexión
  public getConnectionStatus() {
    return this.isConnected.asObservable();
  }

  // Obtener el estado de la API
  public getApiStatus() {
    return this.isApiConnected.asObservable();
  }

  // Método para obtener el estado combinado de conexión
  public getFullConnectionStatus() {
    return combineLatest([this.isConnected.asObservable(), this.isApiConnected.asObservable()]).pipe(
      map(([internet, api]) => internet && api) // Devuelve true solo si ambos son true
    );
  }
}
