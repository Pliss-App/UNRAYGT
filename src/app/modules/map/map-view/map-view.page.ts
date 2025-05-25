import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as tt from '@tomtom-international/web-sdk-maps';
import { LocationService } from 'src/app/core/services/location.service';


@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss'],
})
export class MapViewPage implements OnInit, AfterViewInit {
  map: tt.Map | undefined;

  constructor( private location: LocationService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initializeMap();

  }



  initializeMap() {
    this.getCurrentPosition();
  }
  getCurrentPosition() {

    this.location.location$.subscribe(coords => {
      this.setMapCenter(coords.lat, coords.lon)

    })
  }
  setMapCenter(lat: number, lon: number) {
    // Inicializa el mapa de TomTom usando la clave de API y el contenedor adecuado
    this.map = tt.map({
      key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',    // Reemplaza con tu clave de API de TomTom
      container: 'map',                    // ID del contenedor del mapa en el HTML
      center: [lon, lat],           // Coordenadas iniciales (Ámsterdam en este ejemplo)
      zoom: 10
    });
    // Añade controles de navegación al mapa
    this.map.addControl(new tt.NavigationControl());

  }


}
