import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RangoService {
  constructor() { }

  // Obtener perfil del usuario actual
  validarRango(servicios: any,valor: number) {
    return servicios.find((servicio: { min_km: number; max_km: number; }) => valor >= servicio.min_km && valor <= servicio.max_km);
  }

}
