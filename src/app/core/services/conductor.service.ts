import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class ConductorService {

  constructor(private apiService: ApiService) { }

  getSolicitudes(id: any) {
    return this.apiService.get(`viaje/solicitudes/${id}`);
  }

  getDetalleVehiculo(id: any) {
    return this.apiService.get(`conductor/detalle-vehiculo/${id}`);
  }


  getMovimientos(id: any) {
    return this.apiService.get(`conductor/movimientos/${id}`);
  }


  procesarSolicitud(idConductor: any, data: any) {
    return this.apiService.post(`viaje/solicitudes/${idConductor}/accion`, data);
  }

  aceptarSolicitud(data: any) {
    return this.apiService.post('viaje/aceptar_solicitud', data);
  }


  gananciasDriver(id: any, fecha: any) {
    return this.apiService.get(`conductor/ganancias/${id}/${fecha}`);
  }


  historialGananciasDriver(id: any, fecha: any) {
    return this.apiService.get(`conductor/historial-ganancias/${id}/${fecha}`);
  }


  getMetodoPago() {
    return this.apiService.get(`conductor/metodospagos`);
  }




  getCallSecurity() {
    return this.apiService.get(`conductor/callsecurity`);
  }


}
