import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';
import { ModalController } from '@ionic/angular';
import { SearchDirectionComponent } from '../search-direction/search-direction.component';

import { SharedService } from 'src/app/core/services/shared.service';
import { reverseGeocoding } from 'src/app/utils/fnReutilizables';
import { ServicioService } from 'src/app/core/services/servicio.service';
import { RangoService } from 'src/app/core/services/rango.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SolicitudService } from 'src/app/core/services/solicitud.service';
import { Subscription } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
})
export class BottomSheetComponent implements AfterViewInit, OnChanges {
  @ViewChild('bottomSheet', { read: ElementRef }) bottomSheet!: ElementRef;
  @ViewChild('contentDiv') contentDiv!: ElementRef;
  initialHeight: number = 0;
  private resizeObserver!: ResizeObserver;

  estadoSolicitud: string = '';
  conductorSeleccionado: string | null = null;
  minHeight = 100;  // Altura mínima del bottom sheet en píxeles
  maxHeight = window.innerHeight * 0.8;  // Altura máxima del bottom sheet (80% de la pantalla)
  currentHeight = 280;
  services: any = [];
  suggestions: string[] = [];
  lat: number = 0;
  lng: number = 0;
  @Input() data: string | null = null;
  directionSalida: any = "";
  directionDestino: any = "";
  listDestination: any = [];
  direccion: string = "";
  distance: any = null;
  listadoCostos: any = null;
  costoViaje: any = null;
  selectedServiceId: number | null = 1;
  isModalOpen = false;
  isActive: boolean = true;
  solicitud: any = {};
  idUser: any = {};
  private solicitudSubscription: Subscription | undefined;
  respuesta: any;
  responseSolicitud: any = null;
  kmInvalido: boolean = false;


  constructor(private ngZone: NgZone,
    private storage: StorageService,
    private location: LocationService,
    private solicitudService: SolicitudService, private authService: AuthService,
    private rango: RangoService, private sharedService: SharedService,
    public modalController: ModalController, private gestureCtrl: GestureController,
    private renderer: Renderer2, private userService: UserService,
    private service: ServicioService) {
    this.positionSalida();
    this.idUser = this.authService.getUser();
    this.solicitud.idService = this.selectedServiceId;
   
    this.solicitud.idConductor = null;
    this.location.location$.subscribe(async coords => {
      this.lat = coords.lat;
      this.lng = coords.lon;
      this.directionSalida = await reverseGeocoding(this.lat, this.lng);
      this.solicitud.start_lat = this.lat;
      this.solicitud.start_lng = this.lng;
      this.solicitud.start_direction = this.directionSalida;
      this.solicitud.fecha = this.obtenerFechaHoraLocal();
      this.solicitud.hora = this.getCurrentTime;
    })
    this.getServicioCosto();
  }

  getHeithDiv() {
    if (this.contentDiv) {
      this.resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const newHeight = entry.contentRect.height;
          document.documentElement.style.setProperty('--dynamic-height', `${newHeight}px`);
        }
      });

      this.resizeObserver.observe(this.contentDiv.nativeElement);
    }
  }

  ngAfterViewInit() {
        this.sharedService.getServiceSelect(this.selectedServiceId);
    this.getServicios();
    this.initializeGesture();
    this.meDestination();
    this.meDistance();
    this.getHeithDiv()
  }

  async ngOnInit() {
     
    this.checkSolicitudEstado();

    // Escuchar si la solicitud expira

    // Escuchar las respuestas en tiempo real
    this.solicitudSubscription = await this.solicitudService.solicitudRespuesta$.subscribe(
      (respuesta) => {
        this.respuesta = respuesta;
        this.responseSolicitud = null;
        if (this.respuesta.success == false) {
          this.responseSolicitud = 'danger';
          this.estadoSolicitud = this.respuesta.message;
          setTimeout(() => {
            this.estadoSolicitud = ''
          }, 3000)
          //    this.userService.deleteSolicitud(this.respuesta.idSoli)
        } else {
          this.responseSolicitud = 'success';
          this.estadoSolicitud = this.respuesta.message;
          setTimeout(() => {
            this.estadoSolicitud = ''
          }, 3000)
        }

      }
    );
  }


  //limpiar al regresar
  ionViewWillEnter() {
    this.directionDestino = "";
  }

  //limpiar al salir
  ionViewWillLeave() {
    this.costoViaje = null;
    this.distance = null;
    this.isActive = true;
    this.estadoSolicitud = '';
    this.directionDestino = "";
    this.conductorSeleccionado = null;
  }


  async getServicioCosto() {
    const response = await this.service.getCostoServicios(1);
    response.subscribe((re) => {

      this.listadoCostos = re.result;
    })

  }

  positionSalida() {
    this.sharedService.currentData.subscribe(async (data) => {
      if (data) {

        this.lat = data.lat;
        this.lng = data.lng;


        if (data?.address && data.address.trim() !== '') {
          this.directionSalida = data.address;
        } else {
          this.directionSalida = await reverseGeocoding(this.lat, this.lng);
        }

        this.solicitud.start_lat = this.lat;
        this.solicitud.start_lng = this.lng;
        this.solicitud.start_direction = this.directionSalida;
      }

    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      // console.log('Cambio detectado en data:', changes['data'].currentValue);
      // Puedes manejar cualquier otra lógica en respuesta a este cambio
    }
  }

  initializeGesture() {
    const gesture = this.gestureCtrl.create({
      el: this.bottomSheet.nativeElement,
      gestureName: 'bottom-sheet-swipe',
      onMove: (ev) => this.handleMove(ev),
      onEnd: () => this.handleEnd(),
    });
    gesture.enable();
  }


  getServicios() {
    try {
      const response = this.userService.getServicios();
      response.subscribe((re) => {
        if (re.result) {
          this.services = re.result;
          this.services = this.services.reverse();
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  handleMove(ev: any) {
    const newHeight = this.currentHeight - ev.deltaY;
    this.currentHeight = Math.max(this.minHeight, Math.min(newHeight, this.maxHeight));
    this.renderer.setStyle(this.bottomSheet.nativeElement, 'height', `${this.currentHeight}px`);
  }

  handleEnd() {
    this.renderer.setStyle(this.bottomSheet.nativeElement, 'height', `${this.currentHeight}px`);
  }

  async presentModal(item: any) {
    var lat: any = null;
    var lng: any = null;
    if (item == 'salida') {
      lat = this.lat;
      lng = this.lng;
    } else {
      lat = this.lat;
      lng = this.lng;
    }

    if (!this.isModalOpen) {
      this.isModalOpen = true;
      const modal = await this.modalController.create({
        component: SearchDirectionComponent,
        componentProps: {
          lat: lat,
          lng: lng,
          direction: item
        }
      });
      modal.onDidDismiss().then((dataReturned) => {
        this.isModalOpen = false;
        if (dataReturned !== null) {
          var data = dataReturned.data;

          if (data.destination == 'destino') {
            var coordenadas = { lat: data.lat, lng: data.lng }
            this.sharedService.destination(coordenadas);
            this.isActive = false;
          }
        }
      });

      return await modal.present();
    }
  }

  meDestination() {
    this.sharedService.medestination.subscribe(async (data) => {

      if (data) {

        if (data?.address != '') {
          this.directionDestino = data.address
        } else {
          this.directionDestino = await reverseGeocoding(data.lat, data.lng)
        }

        // this.directionDestino = await reverseGeocoding(data.lat, data.lng);
        this.solicitud.end_direction = this.directionDestino;
        this.solicitud.end_lat = data.lat;
        this.solicitud.end_lng = data.lng;
        this.isActive = false;
      } else {
        this.isActive = true;
      }
    });
  }

  meDistance() {
    this.sharedService.meDistance.subscribe(async (data) => {

      if (data) {
        this.distance = data;
        this.currentHeight = 350;
        if (this.distance != null) {
          this.bottomSheet.nativeElement.style.height = '39vh';
          this.obtenerCostoViaje(this.distance.distance);
          this.solicitud.distance = this.distance.distance;
          this.solicitud.duration = this.distance.time;
          this.solicitud.distance_unit = this.distance.abrdistance;
          this.solicitud.duration_unit = this.distance.abrtime;
        }
      }
    });
  }

  // Simular el proceso de búsqueda
  async onSearch(event: any, item: any) {
    this.presentModal(item);
    /*  const modal = await this.modalController.create({
        component: SearchDirectionComponent
      });
      return await modal.present(); */
  }

  addDestination(item: any) {

  }

  async getService(item: any) {
    this.selectedServiceId = item.id;
    this.solicitud.idService = this.selectedServiceId;
    this.sharedService.getServiceSelect(this.selectedServiceId);
    const response = await this.service.getCostoServicios(item.id);
    response.subscribe((re) => {
      this.listadoCostos = re.result;
      if (this.distance != null) {
        this.bottomSheet.nativeElement.style.height = '39vh';
        this.solicitud.distance = this.distance.distance;
        this.solicitud.duration = this.distance.time;
        this.solicitud.distance_unit = this.distance.abrdistance;
        this.solicitud.duration_unit = this.distance.abrtime;
        this.obtenerCostoViaje(this.distance.distance);
      }

    })
  }

  obtenerCostoViaje(km: any) {

    const servicio = this.rango.validarRango(this.listadoCostos, km);

    if (servicio) {
      var suma = servicio.costo_base + (servicio.precio_km * km);
      this.costoViaje = Math.round(suma);
      this.solicitud.costo = this.costoViaje;
      this.kmInvalido = false;
    } else {


      this.kmInvalido = true;
    }
  }


  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async solicitar() {
    try {
      this.sharedService.activeMenuLat(true);
      this.estadoSolicitud = '';
      this.conductorSeleccionado = null;
      const user: any = this.authService.getUser();
      this.solicitud.idUser = user.idUser;
      this.solicitud.fecha_hora = new Date().toISOString();
      await this.delay(3000); // esto funciona
      this.storage.setItem('solicitudEstado', JSON.stringify({ estado: 'pendiente', solicitud: this.solicitud }))
      this.solicitudService.enviarSolicitudAConductor(
        this.solicitud,
        (estado) => {
          this.estadoSolicitud = estado; // Actualiza el estado en tiempo real
          this.saveSolicitudRespuesta(estado);

        },
        (conductorId) => {
          this.conductorSeleccionado = conductorId; // Conductor que aceptó
        }
      );

    } catch (error) {
      console.error("Ocurrio error :", error)
    }
  }

  async saveSolicitudRespuesta(estado: string) {
    // Guardar la respuesta de la solicitud en el almacenamiento
    this.storage.setItem('solicitudEstado', JSON.stringify({ estado, solicitud: this.solicitud }))

    // Limpiar el estado después de un tiempo
    await this.delay(5000);
    this.estadoSolicitud = ''
    /* setTimeout(() => {
      
 
     }, 5000) */
  }


  async checkSolicitudEstado() {
    const storedEstado = await this.storage.getItem('solicitudEstado')

    if (storedEstado.value) {
      const estadoData = JSON.parse(storedEstado.value);
      this.estadoSolicitud = estadoData.estado;
      this.solicitud = estadoData.solicitud;

      // Si la solicitud está pendiente, podrías mostrar un mensaje o hacer algo
      if (this.estadoSolicitud === 'pendiente') {
        console.log('La solicitud está pendiente...');
      } else {
        console.log('Estado de la solicitud:', this.estadoSolicitud);
      }
    }
  }


  obtenerFechaHoraLocal(): string {
    const now = new Date();
    return now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0'); // Obtiene el día con 2 dígitos
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes con 2 dígitos
    const year = now.getFullYear().toString(); // Obtiene el año

    return `${day}${month}${year}`;
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // Horas con 2 dígitos
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Minutos con 2 dígitos
    const seconds = now.getSeconds().toString().padStart(2, '0'); // Segundos con 2 dígitos

    return `${hours}${minutes}${seconds}`;
  }
}
