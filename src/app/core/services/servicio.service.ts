import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  constructor(private apiService: ApiService) { }


  getCostoServicios(id:any) {
    return this.apiService.get( `servicios/costos/${id}`);
  }

  createProfile(data: any) {
    return this.apiService.post('user/registro', data);
  }

  // Actualizar perfil del usuario
  updateUserProfile(data: any) {
    return this.apiService.put('user/profile', data);
  }
}
