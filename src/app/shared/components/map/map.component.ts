import { Component, Input, OnInit } from '@angular/core';

import { SharedService } from 'src/app/core/services/shared.service';
import { async, Subscription } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { IMAGES } from '../../../constaints/image-data';  // Importar la imagen
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})

export class MapComponent implements OnInit {
  @Input() markers: { lat: number; lon: number; label?: string }[] = [];
  latitude: number | undefined;
  longitude: number | undefined;
  map: any;
  currentPosition = { lat: 0, lon: 0 };
  currentMarker: any;
  markeWatchPosition: any = null;
  positionSubscription: Subscription | undefined;
  googleStyleIconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  markerDestination: any = null;
  coordSalida: any = null;
  coordDestino: any = null;
  ruteEstimate: any = null;
  routeLayer: any = null;
  private intervaloDrivers: any;
  lastPosition: google.maps.LatLng | null = null;
  directionsServiceUserCli = new google.maps.DirectionsService();
  directionsDisplayUserCli = new google.maps.DirectionsRenderer({
    suppressMarkers: true, //Eliminanlos Marcadores
    polylineOptions: {
      strokeColor: '#2b2b2b',      // Gris oscuro tirando a negro (#2b2b2b es muy usado)
      strokeOpacity: 0.85,          // Un poco translúcido, no totalmente sólido
      strokeWeight: 3,              // Grosor fino tipo Uber
      strokeLineCap: 'round',       // Puntas redondeadas (requiere usar Polylines custom si quieres más control)
      strokeLineJoin: 'round'       // Unión suave entre segmentos
    }
  });
  private currentTipoVehiculo: string | null = null; // Guarda el último tipo
  user: any;
  iconDriver: any;
  listDriver: any = [];
  driverMarkers: { [id: number]: google.maps.Marker } = {};



  coordUserDriver: any = null;

  constructor(private location: LocationService,
    private sharedDataService: SharedService,
    private api: UserService,
    private auth: AuthService) {
    this.user = this.auth.getUser();

  }

  async ngOnInit() {
    await this.getCurrentPosition();
    this.meLocation();

    this.meDestination();
    this.sharedDataService.service.subscribe((data) => {
      if (data && data !== this.currentTipoVehiculo) {
        this.currentTipoVehiculo = data;
        this.clearDriverMarkers(); // Solo si cambia el tipo
        this.getListadoConductores(); // Ejecuta inmediatamente
      }
    });

    // Suscripción a coordenadas del usuario
    this.sharedDataService._coordUserDirver.subscribe((coords: any) => {
      if (coords) {
        this.coordUserDriver = coords;
      }
    });

    // Inicia el intervalo cada 10 segundos
    this.iniciarIntervaloConductores();
  }


  ionViewWillEnter() {
    this.routeLayer = null;

  }


  ionViewWillLeave() {
    if (this.markerDestination) {
      this.markerDestination.remove();
      this.markerDestination = null;
    };

    this.coordSalida = null;
    this.coordDestino = null;
    this.ruteEstimate = null;

    if (this.intervaloDrivers) {
      clearInterval(this.intervaloDrivers);
      this.intervaloDrivers = null;
    }
  }

  async getCurrentPosition() {

    this.location.getUserLocation().then(async (re: any) => {
      if (re) {
        this.initializeMap(re?.lat, re?.lon);

        this.currentPosition.lat = re?.lat;
        this.currentPosition.lon = re?.lon;
      }/* else {
        const response = await this.api.getLocationUbicationuser(this.user.idUser);
        response.subscribe((re) => {
    
          if (re.result) {
            const data = re.result;
            this.initializeMap(data?.latitude, data?.longitude);
            this.currentPosition.lat = data?.latitude;
            this.currentPosition.lon = data?.longitude;
          }
        });
      }*/
      this.sharedDataService.getCoordUserDriver(re);
      this.meLocationMapa();
    })



  }


  iniciarIntervaloConductores() {
    this.getListadoConductores(); // Ejecuta una vez al inicio
    this.intervaloDrivers = setInterval(() => {
      this.getListadoConductores(); // Solo usa la última coordenada almacenada
    }, 10000);
  }




  async initializeMap(lat: number, lon: number) {
    let latLng = new google.maps.LatLng(lat, lon);
    this.map = new google.maps.Map(document.getElementById("map"), {
      center: latLng,
      zoom: 18,
      disableDefaultUI: true,
      rotateControl: true,
    });
    this.directionsDisplayUserCli.setMap(this.map);
    this.coordSalida = { lng: lon, lat: lat };
    this.currentMarker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      draggable: true,
      title: 'Tu ubicación',
      icon: {
        url: `assets/marker/userlocal.png`, // Ruta de tu icono personalizado
        scaledSize: new google.maps.Size(39, 50), // Tamaño del icono
        anchor: new google.maps.Point(25, 50),// Punto central del icono
        rotation: 0, // Rotación inicial
      } as any
    });

    this.getDraggableMarkerMiPosition();


    this.markeWatchPosition = new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: 'Tu ubicación',
      icon: {
        url: `assets/marker/position.png`, // Ícono clásico de Google Maps
        scaledSize: new google.maps.Size(18, 18),
        anchor: new google.maps.Point(25, 25),
      } as any
    });

    this.startWatchPosition()
  }


  getAzoomMapa() {
    this.map.addListener('zoom_changed', () => {
      const zoomLevel = this.map.getZoom(); // Obtener el nivel de zoom actual
      const newStrokeWeight = this.calculateStrokeWeight(zoomLevel); // Calcular el nuevo grosor

      this.directionsDisplayUserCli.setOptions({
        polylineOptions: {
          strokeColor: 'rgb(78, 78, 78)',
          strokeOpacity: 1.0,
          strokeWeight: newStrokeWeight
        }
      });
    });
  }

  calculateStrokeWeight(zoom: number): number {
    if (zoom <= 10) return 2; // Lejos
    if (zoom <= 14) return 4; // Medio
    if (zoom <= 17) return 6; // Cercano
    return 8; // Muy cercano
  }
  getDraggableMarkerMiPosition() {
    // Evento dragend: Se activa cuando el marcador deja de moverse
    google.maps.event.addListener(this.currentMarker, 'dragend', () => {
      const position = this.currentMarker?.getPosition(); // Obtener la nueva posición
      const lat = position?.lat(); // Latitud
      const lng = position?.lng(); // Longitud

      this.coordSalida = { lng: lng, lat: lat }
      this.actualizarDato(lng, lat);
      this.sharedDataService.getCoordUserDriver(this.coordSalida);

      if (this.coordDestino != null) {
        this.calculeRouter();
      }
    })
  }

  actualizarDato(lng: number, lat: number) {
    const data = { lat: lat, lng: lng, address: '' };
    this.sharedDataService.setData(data);
  }



  async startWatchPosition() {
    this.location.watchLocation$.subscribe((coords) => {
      const newLatLng = new google.maps.LatLng(coords.lat, coords.lon);

      const rotation = this.lastPosition
        ? this.calculateRotation(this.lastPosition, newLatLng)
        : 0;

      if (!this.markeWatchPosition) return;

      this.markeWatchPosition.setIcon({
        url: `assets/marker/position.png`,
        scaledSize: new google.maps.Size(18, 18),
        anchor: new google.maps.Point(25, 25),
      } as any);

      if (this.lastPosition) {
        this.animateMarker(this.markeWatchPosition, this.lastPosition, newLatLng, 500); // 500ms animación
      } else {
        this.markeWatchPosition.setPosition(newLatLng);
      }

      this.lastPosition = newLatLng;
    });
  }

  animateMarker(marker: google.maps.Marker, from: google.maps.LatLng, to: google.maps.LatLng, duration: number) {
    const start = performance.now();

    const fromLat = from.lat();
    const fromLng = from.lng();
    const toLat = to.lat();
    const toLng = to.lng();

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1); // progreso [0,1]

      const currentLat = fromLat + (toLat - fromLat) * t;
      const currentLng = fromLng + (toLng - fromLng) * t;

      marker.setPosition(new google.maps.LatLng(currentLat, currentLng));

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  calculateRotation(start: google.maps.LatLng, end: google.maps.LatLng): number {
    if (!start || !end) return 0;

    const deltaX = end.lng() - start.lng();
    const deltaY = end.lat() - start.lat();
    const angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI); // Convertir de radianes a grados

    return (angle + 360) % 360; // Asegura que el ángulo esté entre 0° y 360°
  }

  meLocation() {
    this.sharedDataService.melocation.subscribe((data) => {
      if (data) {

        this.actualizarDato(data.lng, data.lat);
        this.sharedDataService.getCoordUserDriver(data);
        this.coordSalida = { lng: data.lng, lat: data.lat }
        this.currentMarker.setLngLat([data.lng, data.lat]);
        this.map.setZoom(15);
        this.map.setCenter([data.lng, data.lat]);

        if (this.coordDestino != null) {
          this.calculeRouter();
        }
      }
    });
  }


  meLocationMapa() {
    this.sharedDataService.currentData.subscribe((data) => {

      this.sharedDataService.setMapaBottom(data);
      if (data) {
        const newLatLng = new google.maps.LatLng(
          data.lat,
          data.lng
        );
        this.coordSalida = { lng: data.lng, lat: data.lat };
        this.sharedDataService.getCoordUserDriver(this.coordSalida);
        if (this.currentMarker) {

          this.currentMarker?.setPosition(newLatLng);
        } else {

          this.currentMarker = new google.maps.Marker({
            position: newLatLng,
            map: this.map,
            title: 'Tu Destino',
            icon: {
              url: `assets/marker/destino2.png`,
              scaledSize: new google.maps.Size(45, 45),

              anchor: new google.maps.Point(17.5, 35),
            } as any
          });
        }

        if (data.direction === 'destino') {
          this.calculeRouter()
        }

        this.map?.setCenter(newLatLng);

        // this.map.setCenter([data.lng, data.lat]);
      }

    });
  }




  meDestination() {
    this.sharedDataService.medestination.subscribe((data) => {
      if (data) {
        const newLatLng = new google.maps.LatLng(
          data.lat,
          data.lng
        );
        this.coordDestino = { lng: data.lng, lat: data.lat }
        if (this.markerDestination) {

          this.markerDestination?.setPosition(newLatLng);
          //this.markerDestination.setLngLat([data.lng, data.lat]);
        } else {

          this.markerDestination = new google.maps.Marker({
            position: newLatLng,
            map: this.map,
            title: 'Tu Destino',
            icon: {
              url: `assets/marker/destino2.png`, // Ícono clásico de Google Maps
              scaledSize: new google.maps.Size(35, 35),
              // anchor: new google.maps.Point(25, 50),
              anchor: new google.maps.Point(17.5, 35),
            } as any
          });

          // this.actualizarDato(data.lng, data.lat);
        }

        if (data.direction === 'destino') {
          this.calculeRouter()
        }

        this.map?.setCenter(newLatLng);

        // this.map.setCenter([data.lng, data.lat]);
      }
    });
  }

  calculeRouter() {

    try {
      this.directionsServiceUserCli.route(
        {
          origin: { lat: this.coordSalida.lat, lng: this.coordSalida.lng },
          destination: { lat: this.coordDestino.lat, lng: this.coordDestino.lng },
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response: any, status: any) => {
          if (status === "OK") {
            var timeToDestination = null;
            var destinationDistance = null;
            this.directionsDisplayUserCli.setDirections(response);
            this.map?.setZoom(10);
            const route = response.routes[0];
            const legs = route.legs[0];

            timeToDestination = Math.round(legs.duration?.value / 60);
            destinationDistance = Math.round(legs.distance?.value / 1000)

            this.ruteEstimate = {
              distancetext: legs.distance?.text,
              durationtext: legs.duration?.text,
              time: timeToDestination,
              distance: destinationDistance,
              abrtime: 'min',
              abrdistance: 'km'
            };

            this.sharedDataService.distance(this.ruteEstimate);
          }
        }
      )
    } catch (error) {
      console.log("ERROR MOSTRANDO DIRECCIÓN")
    }
  }

  async getListadoConductores() {
    if (!this.coordUserDriver || !this.currentTipoVehiculo) return;

    const value = {
      lat: this.coordUserDriver.lat,
      lng: this.coordUserDriver.lng,
      idService: this.currentTipoVehiculo,
    };

    try {
      const response = await this.api.getListadoConductores(value).toPromise();
      if (response.success) {
        this.listDriver = response.result;
           
        this.updateDriverMarkers();
      } else {
        console.log("No se encontraron conductores");
      }
    } catch (error: any) {
      if (error.status == 404) {
        this.clearDriverMarkers();
        console.log("No se encontraron conductores para el servicio seleccionado.");
      } else {
        console.log("Error al obtener conductores");
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      if (this.markerDestination) {
        this.markerDestination.remove();
        this.markerDestination = null;    // Limpia la referencia
      }

      this.directionsDisplayUserCli.setMap(null);
      this.map = null;   // Limpia la referencia
    }
  }


  updateDriverMarkers() {
    this.listDriver.forEach(async (driver: any) => {
      const driverLatLng = new google.maps.LatLng(driver.lat, driver.lon);

      const existingMarker = this.driverMarkers[driver.id];

      if (existingMarker) {
        // Si el marcador ya existe, animamos suavemente el movimiento
        this.animateMarkerTo(existingMarker, driverLatLng, driver.angle,  driver.marker);
      } else {
        // Crear nuevo marca
        const newMarker = new google.maps.Marker({
          position: driverLatLng,
          map: this.map,
          icon: {
            url: this.createCustomPointElement(driver.angle, driver.marker),
            scaledSize: new google.maps.Size(30, 30),
            rotation: driver.angle
          },
          title: `${driver.nombre} ${driver.apellido}`,
        });

        this.driverMarkers[driver.id] = newMarker;
      }
    });
  }

  animateMarkerTo(marker: google.maps.Marker, newPosition: google.maps.LatLng, newAngle: number,tipmarker:any) {
    const currentPosition = marker.getPosition();
    if (!currentPosition) return;

    const deltaLat = (newPosition.lat() - currentPosition.lat()) / 10;
    const deltaLng = (newPosition.lng() - currentPosition.lng()) / 10;

    let step = 0;
    const interval = setInterval(() => {
      if (step >= 10) {
        clearInterval(interval);
        return;
      }

      const updatedLat = currentPosition.lat() + deltaLat * step;
      const updatedLng = currentPosition.lng() + deltaLng * step;

      const interpolatedPosition = new google.maps.LatLng(updatedLat, updatedLng);
      marker.setPosition(interpolatedPosition);

      // Puedes también actualizar la rotación si usas íconos rotables personalizados (ej. con canvas o SVG)
       marker.setIcon({  url: this.createCustomPointElement(newAngle,tipmarker), // Mismo ícono
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(25, 25),
        rotation: newAngle});

      step++;
    }, 50); // total ~500ms animación suave
  }

  createCustomPointElement(angle: number, marker:any): string {
    var img: any;
    if (marker == 'moto') {
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

  clearDriverMarkers() {
    Object.values(this.driverMarkers).forEach(marker => {
      marker.setMap(null); // Quita el marcador del mapa
    });
    this.driverMarkers = {}; // Limpia el objeto
  }

}
