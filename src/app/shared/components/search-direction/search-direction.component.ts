import { AfterViewInit, Component, Input, NgZone, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { SharedService } from 'src/app/core/services/shared.service';
declare var google: any;

@Component({
  selector: 'app-search-direction',
  templateUrl: './search-direction.component.html',
  styleUrls: ['./search-direction.component.scss'],
})
export class SearchDirectionComponent implements OnInit {
  map: google.maps.Map | undefined;
  marker: google.maps.Marker | undefined;
  geocoder = new google.maps.Geocoder();
  service = new google.maps.places.AutocompleteService();
  geo: any;
 direccionEnviar= '';
  searchText: string = '';
  savedAddresses: { description: string;place_id: string/*; lng: number, id: string*/ }[] = [];
  // Data passed in by componentProps
  @Input() direction: string | undefined;
  @Input() lastName: string | undefined;
  @Input() middleInitial: string | undefined;
  isFijar: boolean = false;
  lat: any;
  lng: any;

  latitude: any;
  longitude: any;
  currentMarker: any;
  positionSubscription: Subscription | undefined;
  googleStyleIconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  data: any;
  autocompleteItems: any;
  constructor(private modalController: ModalController,
    private sharedDataService: SharedService, private zone: NgZone,
    public modalCtrl: ModalController, navParams: NavParams,
  ) {
   
  }

  ngOnInit() {
    this.getCurrentPosition();
  }

  getCurrentPosition() {
    this.initializeMap(this.lat, this.lng);

  }

  async initializeMap(lat: number, lon: number) {
    let latLng = new google.maps.LatLng(lat, lon);
    this.map = new google.maps.Map(document.getElementById("map_direction"), {
      center: latLng,
      zoom: 18,
      disableDefaultUI: true,
      rotateControl: true,
    });


    this.getMarker(latLng);

  }


  getMarker(latLng: any) {
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

    // Evento dragend: Se activa cuando el marcador deja de moverse
    google.maps.event.addListener(  this.currentMarker, 'dragend', () => {
      this.isFijar = false;
      const position =   this.currentMarker?.getPosition(); // Obtener la nueva posición
      const lat = position?.lat(); // Latitud
      const lng = position?.lng(); // Longitud
      this.latitude = lat;
      this.longitude = lng;
      const newLatLng = new google.maps.LatLng(
        lat,
        lng
      );

      if (this.direction == 'salida') {
        const data = { lat: lat, lng: lng, direction: 'salida' ,address : this.direccionEnviar };
        this.sharedDataService.  setData(data);
      } else if (this.direction == 'destino') {
        const data = { lat: lat, lng: lng, direction: 'destino' , address : this.direccionEnviar};
        this.sharedDataService.destination(data);
      }

      this.map?.setCenter(newLatLng);
     // this.reverseGeocoding(lat, lng);
      this.isFijar = true;
      // Aquí puedes hacer lo que necesites con las coordenadas obtenidas
    });
  }

  searchAddress(event: any) {
    const query = event.target.value;
    if (!query || query.trim() === '') return;
    var data = null;
    let me = this;
    this.service.getPlacePredictions({ input: query, componentRestrictions: { country: 'GT' } }, function (predictions: any, status: any) {
      me.savedAddresses = [];
      me.zone.run(function () {
        if (predictions === null) {
          //console.log("si se encuentra");
        }
        else {
          predictions.forEach(function (prediction: any) {
            me.savedAddresses.push({description: prediction.description,
              place_id: prediction.place_id
          });
          });
        }
      });
    });

  }


    //convert Address string to lat and long
    geoCode(address:any) {
      this.direccionEnviar= address;
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': address }, (results:any, status:any) => {
      this.isFijar = false;
      if (this.currentMarker) {
        this.latitude = results[0].geometry.location.lat();
        this.longitude = results[0].geometry.location.lng();
        const newLatLng = new google.maps.LatLng(
          results[0].geometry.location.lat(),
          results[0].geometry.location.lng()
        );
        this.currentMarker?.setPosition(newLatLng);
        this.isFijar = true;

        this.map?.setCenter(newLatLng);
        this.savedAddresses = [];
  
        if(this.direction == 'destino'){
          const data = { lat: this.latitude, lng: this.longitude, direction: 'destino', address : this.direccionEnviar };
          this.sharedDataService.destination(data);
        } else  if(this.direction == 'salida'){
          const data = { lat: this.latitude, lng: this.longitude, direction: 'salida', address : this.direccionEnviar };
          this.sharedDataService.setData(data);
        }
 
      }
  
    // alert("lat: " + this.latitude + ", long: " + this.longitude);
     });
   }  

  getDirection(item: any) {
    this.isFijar = false;
    if (this.currentMarker) {
      this.latitude = item.lat;
      this.longitude = item.lng;
      this.currentMarker.setLngLat([item.lng, item.lat]);
      this.isFijar = true;
      const newLatLng = new google.maps.LatLng(
        item.lng, item.lat
      );

      this.map?.setCenter(newLatLng);
      this.savedAddresses = [];

      if(this.direction == 'destino'){
        const data = { lat: item.lat, lng: item.lng, direction: 'destino', address : this.direccionEnviar };
        this.sharedDataService.destination(data);
      } else if(this.direction == 'salida'){
        const data = { lat: item.lat, lng: item.lng, direction: 'salida', address : this.direccionEnviar };
        this.sharedDataService.setData(data);
      }

    }
  }

    chooseItem(item: any) {

      //this.viewCtrl.dismiss(item);
      this.geoCode(item.description);//convert Address to lat and long */
    }

  onClearSearch() {
    this.searchText = '';
    this.savedAddresses = [];
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  closeAndReturnData() {
    var data: any = null;
    if (this.direction === 'salida') {
      data = {
        lat: this.latitude,
        lng: this.longitude,
        direction: this.direction
      };
    } else if (this.direction === 'destino') {
      data = {
        lat: this.latitude,
        lng: this.longitude,
        direction: this.direction
      };
    }

    this.modalController.dismiss(data);
  }



  fijarAndReturnData() {
    var data: any = null;
    if (this.direction === 'salida') {
      data = {
        address:this.direccionEnviar,
        lat: this.lat,
        lng: this.lng,
        direction: this.direction
      };
    } else if (this.direction === 'destino') {
      data = {
        address:this.direccionEnviar,
        lat: "this.lat",
        lng: "this.lng",
        direction: this.direction
      };
    }

    this.modalController.dismiss(data);
  }


}
