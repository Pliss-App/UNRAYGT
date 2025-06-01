import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/core/services/shared.service';
import { UserService } from 'src/app/core/services/user.service';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Capacitor } from '@capacitor/core';
import { IMAGES } from '../../../constaints/image-data';  // Importar la imagen

declare var google: any;


@Component({
  selector: 'app-map-routing',
  templateUrl: './map-routing.component.html',
  styleUrls: ['./map-routing.component.scss'],
})
export class MapRoutingComponent implements OnInit, OnChanges {
  @ViewChild('mapRouting', { static: false }) mapElement!: ElementRef;
  @Input() height!: string; // Recibe la altura dinámica
  @Input() idConductor: string | null = null;
  @Input() origin!: { lat: number; lng: number }; // Coordenadas de salida
  @Input() destination!: { lat: number; lng: number }; // Coordenadas de destino
  @Input() estado_viaje: string | null = null;
  @Input() waypoints: { lat: number; lng: number }[] = []; // Puntos intermedios opcionales
  @Input() idSoli: string | undefined; // Puntos intermedios opcionales
  previousCoords: { lon: number, lat: number } | null = null;
  latitude: number | undefined;
  longitude: number | undefined;
  map: any;
  marker: any;
  markerRealtime: any
  markerSalida: any;
  rol: any;
  private lastDriverPosition: google.maps.LatLng | null = null;
  currentMarker: any;
  iconDriver: any = null;
  coordeDriver: any;
  tipoPunto: any = null;
  mensajeNavegacion: any = '';
  tiempo: number = 0;
  intervalEstadoId: any;
  mapHeight: number = window.innerHeight; // Iniciar con la altura de la pantalla
  intervalLocationId: any;
  directionsServiceUserCli = new google.maps.DirectionsService();
  directionsDisplayUserCli = new google.maps.DirectionsRenderer({
    suppressMarkers: true, //Eliminanlos Marcadores
    polylineOptions: {
      strokeColor: 'rgb(59, 59, 59)', // Color de la línea
      strokeOpacity: 1.0, // Opacidad total
      strokeWeight: 8// Ancho de la línea (ajustar según necesidad)
    }
  });
  lastPosition: google.maps.LatLng | null = null;
  user: any = {};

  constructor(private location: LocationService,
    private cdRef: ChangeDetectorRef,
    private shared: SharedService,
    private auth: AuthService,
    private sharedDataService: SharedService,
    private uSer: UserService) {
    this.rol = this.auth.getRole();
    this.user = this.auth.getUser();
  }

  async ngOnInit() {
    await this.getEstadoViajeActual();
    await this.initializeMap();

    await this.activarRuteo();
    //this.cdRef.detectChanges();
    this.meLocation();
    this.resizeMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.resizeMap();
    }
  }

  resizeMap() {
    if (this.mapElement) {
      setTimeout(() => {
        google.maps.event.trigger(this.mapElement.nativeElement, 'resize');
      }, 300); // Pequeña pausa para que se actualice correctamente
    }
  }

  activarRuteo() {
    if (this.tipoPunto == 'A') {
      this.drawRoute(this.tipoPunto)
    } else if (this.tipoPunto == 'B') {
      this.drawRoute(this.tipoPunto)
    }

    setInterval(() => {
      if (this.tipoPunto == 'A') {
        this.drawRoute(this.tipoPunto)
      } else if (this.tipoPunto == 'B') {
        this.drawRoute(this.tipoPunto)
      }
    }, 6000)
  }

  getEstadoViajeActual() {
    if (this.estado_viaje != 'Pendiente de Iniciar') {
      if (this.estado_viaje == 'En Ruta a Pasajero') {
        this.tipoPunto = 'A';
      } else {
        this.tipoPunto = 'B';
      }
    }
    /* else {
      console.log("EL VIAJE NO SE HA INICIADO");
    }*/
    let time = setInterval(() => {
      if (this.estado_viaje != 'Pendiente de Iniciar') {
        if (this.estado_viaje == 'En Ruta a Pasajero') {
          this.tipoPunto = 'A';
        } else {
          this.tipoPunto = 'B';
        }
      }
    }, 1000)
  }

  async initializeMap() {
    let latLng = new google.maps.LatLng(this.origin.lat, this.origin.lng);

    this.map = new google.maps.Map(document.getElementById("map-routing"), {
      center: latLng,
      zoom: 19,
      disableDefaultUI: true,
      rotateControl: true,
    });
    this.map?.setCenter(latLng);
    await this.getDatoDelusuario(latLng)
    this.directionsDisplayUserCli.setMap(this.map);
    if (this.map) {
      await this.addMarkerSalida(new google.maps.LatLng(this.origin.lat, this.origin.lng));
      await this.addMarkerDestino(new google.maps.LatLng(this.destination.lat, this.destination.lng));
    }

    if (this.user.rol == 'usuario') {
      this.getLocationIsUser();
    }


  }

  async getLocationIsUser() {
    if (this.map) {


      const response = await this.uSer.getLocationUbicationuser(this.user.idUser);
      response.subscribe((re) => {
        if (re.success) {
          const data = re.result;
          var lat = data.latitude;
          var lng = data.longitude;
        
          this.markerRealtime = new google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            draggable: false,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8, // Tamaño del círculo
              fillColor: "#4285F4", // Azul Google
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });
        }

        // 👉 Aquí agregamos un interval para actualizar el marker
        setInterval(async () => {


          const newResponse = await this.uSer.getLocationUbicationuser(this.user.idUser);

          newResponse.subscribe((re) => {


            if (re.success) {
              const data = re.result;
              var lat = data.latitude;
              var lng = data.longitude;

              const newLatLng = new google.maps.LatLng(lat, lng);
              // Actualizar posición del marker
              this.markerRealtime.setPosition(newLatLng);
              // Opcional: si quieres mover el centro del mapa también
           //   this.map.setCenter(newLatLng);
            }

          })

        }, 5000); // Cada 5 segundos

      })


    }
  }

  getDatoDelusuario(latLng: any) {
    if (this.rol != 'conductor') {
      //POSICION DEL USUARIO - SI ES PERFIL USUARIO
      this.getLocationUser();
    } else {
      //POSICION DEL CONDUCTOR EN TIEMPO REAL  - SI ES PERFIL CONDUCTOR
      this.startWatchPosition(latLng);
    }
  }

  async startWatchPosition(latLng: any) {
    this.marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: 'Tu ubicación',
      icon: {
        url: this.createCustomPointElement(0), // Ruta de tu icono personalizado
        scaledSize: new google.maps.Size(50, 50), // Tamaño del icono
        anchor: new google.maps.Point(25, 25), // Punto central del icono
        rotation: 0, // Rotación inicial
      } as any
    });

    this.location.watchLocation$.subscribe((coords) => {
      const newLatLng = new google.maps.LatLng(
        coords.lat,
        coords.lon
      );

      // Actualizar la posición y rotación del marcador
      this.marker?.setPosition(newLatLng);
      this.marker?.setIcon({
        url: this.createCustomPointElement(coords.heading), // Mismo ícono
        scaledSize: new google.maps.Size(50, 50),
        anchor: new google.maps.Point(25, 25),
        rotation: coords.heading, // Aplicar rotación
      } as any);
      this.coordeDriver = { lat: coords.lat, lon: coords.lon };

      this.lastPosition = newLatLng;

      if (this.estado_viaje != 'Pendiente de Iniciar') {
        this.map?.setCenter(newLatLng);
      }

    })
  }

  getLocationUser() {
    this.getLocation()
  }

  getLocation() {
    const responses = this.uSer.getIconDriverLocation(this.idConductor);
    responses.subscribe((re) => {
      this.getRouteLocationDriver(re);
      this.intervalLocationId = setInterval(() => {
        this.getRouteLocationDriver(re);
      }, 6000);
    },
      (error) => {
        console.error('Error al obtener coordenadas:', error);
      }

    );

  }

  getRouteLocationDriver(re: any) {
    this.uSer.getLocation(this.idConductor).subscribe(
      (data: any) => {
        this.iconDriver = re.result;
        const { lat, lon, angle } = data.result[0];

        const coordenadas = {
          lon: lon,
          lat: lat,
        };
        this.coordeDriver = data.result[0];

        this.initializeRealTimeMarker(coordenadas, angle)
      })
  }

  // Método para inicializar el marcador
  initializeRealTimeMarker(coords: { lon: number, lat: number, }, angle: number) {
    const newLatLng = new google.maps.LatLng(
      coords.lat,
      coords.lon
    );

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: newLatLng,
        map: this.map,
        title: 'Tu ubicación',
        icon: {
          url: this.createCustomPointElement(angle), // Ruta de tu icono personalizado
          scaledSize: new google.maps.Size(33, 33), // Tamaño del icono
          anchor: new google.maps.Point(25, 25), // Punto central del icono
          rotation: 0, // Rotación inicial
        } as any
      });
    } else {
      // Actualizar la posición y rotación del marcador
      this.marker?.setPosition(newLatLng);
      this.marker?.setIcon({
        url: this.createCustomPointElement(angle),
        scaledSize: new google.maps.Size(33, 33),
        anchor: new google.maps.Point(25, 25),
      } as any);
      // Mover la cámara
      // this.map?.setCenter(newLatLng);
      // Actualizar la última posición
      this.lastPosition = newLatLng;
    }

    if (this.tipoPunto == 'A') {
      //   this.drawRoute('A');
    }

    if (this.tipoPunto == 'B') {
      // this.drawRoute('B');
    }
  }


  createCustomPointElement(angle: number): string {
    var img: any;
    if (this.iconDriver == 'moto' || this.user.marker == 'moto') {
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

  actualizarDato(lng: number, lat: number) {
    const data = { lat: lat, lng: lng };
    this.sharedDataService.setData(data);
  }

  addMarkerSalida(latLng: any) {
    // Determinar el color del marcador según el título
    let url: any; // Color por defecto
    let size: any;
    let punto: any;

    url = `assets/marker/user.png`;
    punto = 'A';
    size = new google.maps.Size(30, 43);

    this.markerSalida = new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: 'Salida',
      icon: {
        url: url, // Ruta de tu icono personalizado
        scaledSize: size, // Tamaño del icono
        anchor: new google.maps.Point(25, 50),// Punto central del icono
        rotation: 0, // Rotación inicial
      } as any
    });
    this.map?.setCenter(latLng);
  }

  addMarkerDestino(latLng: any) {
    // Determinar el color del marcador según el título
    let url: any; // Color por defecto
    let size: any;
    let punto: any;

    url = `assets/marker/destinoroute.png`;
    size = new google.maps.Size(23, 23);
    punto = 'B';

    const currentMarker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: 'Destino',
      icon: {
        url: url, // Ruta de tu icono personalizado
        scaledSize: size, // Tamaño del icono
        anchor: new google.maps.Point(25, 50),// Punto central del icono
        rotation: 0, // Rotación inicial
      } as any
    });
  }

  drawRoute(punto: any) {
    var origin: any;
    var destination: any;

    if (punto == 'B') {

      origin = { lat: this.origin.lat, lng: this.origin.lng };
      destination = { lat: this.destination.lat, lng: this.destination.lng };
    } else {
      origin = { lat: this.coordeDriver.lat, lng: this.coordeDriver.lon };
      destination = { lat: this.origin.lat, lng: this.origin.lng };
    }
    // Solo actualizar si hay un cambio significativo en la posición del conductor
    const currentDriverPosition = new google.maps.LatLng(origin.lat, origin.lng);
    //  this.map?.setCenter(new google.maps.LatLng(origin.lat, origin.lng));
    if (this.lastDriverPosition && google.maps.geometry.spherical.computeDistanceBetween(this.lastDriverPosition, currentDriverPosition) < 2) {
      // No actualizamos si el cambio es menor a 10 metros
      return;
    }

    this.lastDriverPosition = currentDriverPosition;

    this.directionsServiceUserCli.route(
      {
        origin: origin,
        destination: destination,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response: any, status: any) => {
        if (status === "OK") {
          this.directionsDisplayUserCli.setDirections(response);
          this.map?.setCenter(origin);

          const route = response.routes[0];
          const legs = route.legs[0];

          this.tiempo = legs.duration?.text;
          var distancia = legs.distance?.text;
          var data = {
            tiempo: this.tiempo,
            distancia: distancia
          }
          this.shared.changeParam(data);
        }
      })
  }

  meLocation() {
    this.sharedDataService.melocation.subscribe((data) => {
      if (data) {
        let latLng = new google.maps.LatLng(data.lat, data.lng);
        this.marker?.setPosition(latLng);

        this.map.setZoom(20);
        this.map.setCenter(latLng);
        this.actualizarDato(data.lng, data.lat);

      }
    });
  }

  ngOnDestroy() {
    /* if (this.map) {
       this.map.remove();
     }*/

    if (this.intervalEstadoId) {
      clearInterval(this.intervalEstadoId);
    }

    if (this.intervalLocationId) {
      clearInterval(this.intervalLocationId);
    }
    this.getLocation()
  }

}