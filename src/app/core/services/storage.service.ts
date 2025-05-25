import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }


  
  // Guardar un valor
  async setItem(key: string, value: any) {
    await Storage.set({
      key,
      value: JSON.stringify(value), // Convierte a string si es un objeto
    });
  }

  // Obtener un valor
  async getItem(key: string) {
    const item = await Storage.get({ key });
    return item.value ? JSON.parse(item.value) : null; // Parsea si es JSON
  }

  // Eliminar un valor
  async removeItem(key: string) {
    await Storage.remove({ key });
  }

  // Limpiar todo el almacenamiento
  async clearStorage() {
    await Storage.clear();
  }

}
