// src/app/guards/travel.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TravelGuard implements CanActivate {
  user: any;
  constructor( private auth: AuthService,private travelService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> {

    this.user = this.auth.getUser();
    const userId = this.user.idUser; // O donde guardes el ID del usuario
    const timestamp = new Date().getTime(); 
    return this.travelService.checkActiveTravel(userId!,  timestamp).pipe(
      map((response) => {
        if (response?.success) {
          this.router.navigate(['/user/travel-route']); // Redirige a la vista del viaje activo
          return false; // Impide el acceso a la vista actual
        }
        return true; // Permite el acceso si no hay viaje activo
      })
    );
  }
}
