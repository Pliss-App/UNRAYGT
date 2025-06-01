import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private acitveMenu = new BehaviorSubject<any>(null);
  menu = this.acitveMenu.asObservable();


  private popUpCancelar = new BehaviorSubject<any>(null);
  popAction = this.popUpCancelar.asObservable();

  private paramSource = new BehaviorSubject<any>(null);
  time = this.paramSource.asObservable();

  private dataSource = new BehaviorSubject<any>(null);
  currentData = this.dataSource.asObservable();

  private deMapaBootom = new BehaviorSubject<any>(null);
  mapabottom = this.deMapaBootom.asObservable();

  private _locate = new BehaviorSubject<any>(null);
  melocation = this._locate.asObservable();

  private _destination = new BehaviorSubject<any>(null);
  medestination = this._destination.asObservable();

  private _distance = new BehaviorSubject<any>(null);
  meDistance = this._distance.asObservable();

  private km = new BehaviorSubject<any>(null);
  calculo = this.km.asObservable();

  private viaje = new BehaviorSubject<any>(null);
  getValVia = this.viaje.asObservable();


  private selectService = new BehaviorSubject<any>(null);
  service = this.selectService.asObservable();


    private coordUserDirver = new BehaviorSubject<any>(null);
  _coordUserDirver = this.coordUserDirver.asObservable();

  constructor() { }

  // Método para actualizar el dato
  setData(data: any) {
    this.dataSource.next(data);
  }

  // Método para actualizar el dato
  setMapaBottom(data: any) {
    this.deMapaBootom.next(data);
  }

  locate(data: any) {
    this._locate.next(data);
  }

  changeParam(param: any) {
    this.paramSource.next(param);  // Cambia el valor
  }

  actionPopUp(param: any) {
    this.popUpCancelar.next(param);  // Cambia el valor
  }

  activeMenuLat(param: any) {
    this.acitveMenu.next(param);  // Cambia el valor
  }

  destination(data: any) {

    this._destination.next(data);
  }


  distance(data: any) {

    this._distance.next(data);
  }

  kmRecorridos(param: any) {
    this.km.next(param);  // Cambia el valor
  }



  datViaPre(param: any) {
    this.viaje.next(param);  // Cambia el valor
  }


  getServiceSelect(param: any) {
    this.selectService.next(param);  // Cambia el valor
  }

    getCoordUserDriver(param: any) {
    this.coordUserDirver.next(param);  // Cambia el valor
  }

}
