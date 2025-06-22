import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConductorService } from 'src/app/core/services/conductor.service';

@Component({
  selector: 'app-ayuda-boleta',
  templateUrl: './ayuda-boleta.page.html',
  styleUrls: ['./ayuda-boleta.page.scss'],
})
export class AyudaBoletaPage implements OnInit {
  list: any = [];

  constructor(private modalCtrl: ModalController, private api: ConductorService) { }

  ngOnInit() {
    this.getApoyoBoleta();
  }

  async getApoyoBoleta() {
    try {
      const response = await this.api.getApoyoBoleta().toPromise();
      if (response.success) {
        const data = response.result;
        this.list = data;
      }

    } catch (error) {
      console.error(error)
    }
  }

abrirEnlace(item: any) {
  let url = '';

  switch (item.medio.toLowerCase()) {
    case 'correo':
      url = `mailto:${item.enlace}`;
      break;

    case 'whatsapp':
      const phone = item.enlace.replace(/\D/g, ''); // limpia el número
      url = `${item.enlace}`;
      break;

    case 'youtube':
    case 'web':
    default:
      url = item.enlace;
      break;
  }

  window.open(url, '_blank');
}


  cerrarModal() {
    this.modalCtrl.dismiss();
  }


}
