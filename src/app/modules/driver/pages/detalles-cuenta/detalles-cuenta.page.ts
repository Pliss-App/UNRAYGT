import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConductorService } from 'src/app/core/services/conductor.service';

@Component({
  selector: 'app-detalles-cuenta',
  templateUrl: './detalles-cuenta.page.html',
  styleUrls: ['./detalles-cuenta.page.scss'],
})
export class DetallesCuentaPage implements OnInit {

  metodo: any = {
    banco: '',
    titular: '',
    tipo: '',
    moneda: '',
    nocuenta: ''
  };

  isLoading: boolean = false;
  isBanca: boolean = false;
  message: String = "";

  constructor(private modalCtrl: ModalController, private api: ConductorService) { }



  ngOnInit() {
    this.getMetodoPago();
  }

  async getMetodoPago() {
    this.isLoading = true;
    try {
      const res = await this.api.getMetodoPago().toPromise();
      if (res.success != true) {
        this.isLoading = false;
        this.isBanca = false;
      } else {
        this.metodo = res.result;
        this.isBanca = true;
        this.isLoading = false;
      }

    } catch (error: any) {
      if (error) {
        this.message = error?.error?.msg;
        this.isLoading = false;
      }
    } finally {
      this.isLoading = false;
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

}
