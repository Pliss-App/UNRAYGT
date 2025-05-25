/// <reference types="google.maps" />
import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/core/services/shared.service';

import { Subscription } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
declare var google: any;
import { IMAGES } from '../../../../constaints/image-data';  // Importar la imagen

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
})
export class MapaComponent implements OnInit {
  map: google.maps.Map | undefined;
  marker: google.maps.Marker | undefined;
  lastPosition: google.maps.LatLng | null = null;

  //map: any;
  user: any = {};
  //marker: any;
  previousCoords: { lon: number, lat: number } | null = null;
  mapLoaded: boolean = false;

  constructor(private location: LocationService, private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  async ngOnInit() {
    await this.initializeMap();
  }

  async initializeMap() {
    await this.location.location$.subscribe(async coords => {
      let latLng = new google.maps.LatLng(coords.lat, coords.lon);
      this.map = new google.maps.Map(document.getElementById("mapa_conductor"), {
        center: latLng,
        zoom: 20,
        disableDefaultUI: true,
        rotateControl: true,
      });

      this.marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        title: 'Tu ubicación',
        icon: {
          url: this.createCustomPointElement(coords.heading), // Ruta de tu icono personalizado
          scaledSize: new google.maps.Size(50, 50), // Tamaño del icono
          anchor: new google.maps.Point(25, 25), // Punto central del icono
          rotation: 0, // Rotación inicial
        } as any
      });

      this.lastPosition = latLng;
      this.startWatchPosition()
    })
  }

  async startWatchPosition() {
    this.location.watchLocation$.subscribe((coords) => {
      const newLatLng = new google.maps.LatLng(coords.lat, coords.lon);

      if (!this.lastPosition) {
        // Si es la primera vez, colocar directamente el marcador
        this.marker?.setPosition(newLatLng);
        this.lastPosition = newLatLng;
        return;
      }

      // Animar el movimiento del marcador suavemente
      this.smoothMoveMarker(this.marker, this.lastPosition, newLatLng, 500);

      // Actualizar rotación del marcador
      this.marker?.setIcon({
        url: this.createCustomPointElement(coords.heading), // Mismo ícono
        scaledSize: new google.maps.Size(50, 50),
        anchor: new google.maps.Point(25, 25),
        rotation: coords.heading,
      } as any);

      // Guardar la última posición
      this.lastPosition = newLatLng;
    });
  }

  smoothMoveMarker(marker: any, fromLatLng: any, toLatLng: any, duration: any) {
    let startTime = performance.now();

    const animate = (currentTime: any) => {
      let elapsedTime = currentTime - startTime;
      let progress = Math.min(elapsedTime / duration, 1); // Normaliza entre 0 y 1

      let interpolatedLat = fromLatLng.lat() + (toLatLng.lat() - fromLatLng.lat()) * progress;
      let interpolatedLng = fromLatLng.lng() + (toLatLng.lng() - fromLatLng.lng()) * progress;

      marker.setPosition(new google.maps.LatLng(interpolatedLat, interpolatedLng));

      if (progress < 1) {
        requestAnimationFrame(animate); // Continuar la animación
      }
    };

    requestAnimationFrame(animate);
  }


  async getUserLocation() {
    await this.location.location$.subscribe(async coords => {
      let latLng = new google.maps.LatLng(coords.lat, coords.lon);
      this.map?.setCenter(latLng);
    })
  }

  calculateRotation(start: google.maps.LatLng, end: google.maps.LatLng): number {
    if (!start || !end) return 0;

    const deltaX = end.lng() - start.lng();
    const deltaY = end.lat() - start.lat();
    const angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI); // Convertir de radianes a grados

    return (angle + 360) % 360; // Asegura que el ángulo esté entre 0° y 360°
  }



  createCustomPointElement(angle: number): string {
    var img: any;
    if (this.user.marker == 'moto') {
      img = IMAGES.moto;
    } else {
      img = IMAGES.carro;
    }
    const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 100 100">
      <g transform="rotate(${angle}, 50, 50)">
        <image href="${img}" x="0" y="0" height="100" width="100"/>
      </g>
    </svg>
  `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon);
  }


}
