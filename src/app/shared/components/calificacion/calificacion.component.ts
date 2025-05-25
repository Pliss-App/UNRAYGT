import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StorageService } from 'src/app/core/services/storage.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-calificacion',
  templateUrl: './calificacion.component.html',
  styleUrls: ['./calificacion.component.scss'],
})
export class CalificacionComponent implements OnInit {
  @Input() emisorId: number | undefined; // ID del usuario actual
  @Input() receptorId: number | undefined; // ID del conductor
  @Input() idViaje: number | undefined;
  @Input() rol: string | undefined; // ID del usuario actual
  calificacion: number = 5;
  comentario: string = '';
  stars: number[] = [1, 2, 3, 4, 5];
  message: any = '';
  user: any = {}
  isModalOpen = true;
  loading = false;

  constructor(private storageService: StorageService, private api: UserService, private modalController: ModalController, private http: HttpClient) {

  }

  ngOnInit() {

    if (this.rol == 'conductor') {
      this.message = '¿Cómo estuvo el viaje con : '
      //this.getProfile();
    } else {
      this.message = '¿Cómo estuvo el viaje con : '

    }

    this.getProfile();
  }

  getProfile() {
    this.api.profileCalificacion(this.receptorId).subscribe((re) => {
      if (re.msg == "SUCCESSFULLY") {
        this.loading = true;
        var data = re.result;
        this.user = data
      }

    })
  }

  onImageLoad() {
    this.loading = true; // Oculta el skeleton cuando la imagen se carga
  }

  onImageError() {
    this.loading = false; // También ocultamos skeleton si hay error en la imagen
    this.user.foto = 'assets/img/profile.jpg'; // Imagen por defecto si falla
  }

  setCalificacion(valor: number) {
    this.calificacion = valor;
  }

  enviarCalificacion() {
    if (this.calificacion === 0) {
      alert('Por favor, selecciona una calificación.');
      return;
    }

    const califi = {
      id_viaje: this.idViaje,
      evaluador_id: this.emisorId,
      evaluado_id: this.receptorId,
      calificacion: this.calificacion,
      comentario: this.comentario
    }

    this.api.guardarCalificacion(califi).subscribe(() => {
      if (this.rol != 'conductor') {
        this.storageService.removeItem('sms-definido')
      }

      this.modalController.dismiss({
        califico: true, // Ejemplo de dato enviado
      });
    }, error => {
      alert('Error al enviar la calificación');
    });
  }




  // Cerrar el modal
  closeModal() {
    this.modalController.dismiss({ califico: false });
  }

}
