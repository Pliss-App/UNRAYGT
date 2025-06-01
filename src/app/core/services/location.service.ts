import { Injectable, OnInit } from '@angular/core';


import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { UserService } from './user.service';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  public watch: any;
  private locationSubject = new BehaviorSubject<{ lat: number, lon: number, heading: any }>({ lat: 0, lon: 0, heading: 0 });
  private watchLocationSubject = new BehaviorSubject<{ lat: number, lon: number, heading: any }>({ lat: 0, lon: 0, heading: 0 });
  currentPosition: any;
  location$ = this.locationSubject.asObservable();
  watchLocation$ = this.watchLocationSubject.asObservable();
  latitude: number = 0;
  longitude: number = 0;
  user: any;
  watchId: string | null = null;
  constructor(private http: HttpClient, private platform: Platform, private shared: SharedService,
    private userAuth: UserService, private auth: AuthService,
  ) {

  }

  async init() {
    const lastLocation = await Preferences.get({ key: 'lastLocationn' });
    if (lastLocation.value) {
      const coords = JSON.parse(lastLocation.value);
      this.locationSubject.next(coords);
    }

    const permiso = await this.checkPermissions();
    if (permiso) {
      const coords = await this.getUserLocation();
      this.user = this.auth.getUser();

      return coords;
    } else {
      console.warn('Permiso de geolocalización no concedido.');
      return null;
    }
  }


  async lastgetUserLocation() {
    let lastLocation = await Preferences.get({ key: 'lastLocationn' });
    if (lastLocation.value) {
      const coords = JSON.parse(lastLocation.value); // usar mientras llega la nueva
      this.locationSubject.next(coords);
      return coords;
    }
  }

  async getUserLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentPosition = coordinates.coords;
      const coords = {
        lat: coordinates.coords.latitude, lon: coordinates.coords.longitude,
        heading: coordinates.coords.heading
      };
      this.locationSubject.next(coords);

      this.shared.getCoordUserDriver(coords);
      return coords;
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      return null;
    }
  }

  async startTracking() {
    await Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 3000, // 10s de espera
      maximumAge: 0,
    }, (position, err) => {
      if (err) {
        console.error('Error al obtener ubicación:', err);
        return;
      }
      const coords: any = {
        lat: position?.coords.latitude,
        lon: position?.coords.longitude,
        heading: position?.coords.heading
      };
      this.locationSubject.next(coords);
    });
  }



  async watchUserLocation() {

    try {
      this.watch = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 3000, // 10s de espera
          maximumAge: 0,
        },
        (position, err) => {
          if (err) {
            console.error('Error al obtener ubicación:', err);
            return;
          }

          const coords: any = {
            lat: position?.coords.latitude, lon: position?.coords.longitude,
            heading: position?.coords.heading
          };

          this.watchLocationSubject.next(coords);
          var angle = position?.coords.heading;
          var angl: number = Number(angle);
          if (this.auth.isLoggedIn()) {

            if (this.auth.getRole() == 'conductor') {
              this.saveCoordinates(position?.coords.latitude, position?.coords.longitude, angl);
            } else {
              this.saveCoordinates(position?.coords.latitude, position?.coords.longitude, angl);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error al iniciar el seguimiento:', error);
    }
  }

  stopTracking() {
    if (this.watch) {
      this.watch.unsubscribe();
    }
  }



  saveCoordinates(lat: any, lng: any, heading: any) {
    this.user = this.auth.getUser();
    var data = {
      iduser: this.user.idUser,
      lat: lat,
      lon: lng,
      angle: heading
    }
    this.userAuth.updatetLocation(data).subscribe(() => {
    },
      (error) => {
        console.error('Error al enviar las coordenadas:', error);
      });
  }



  async checkPermissions() {
    if (!Capacitor.isNativePlatform()) {
      console.log('El permiso se gestiona automáticamente en la web.');
      return true;
    }

    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

}
