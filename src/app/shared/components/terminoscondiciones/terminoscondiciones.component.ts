import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terminoscondiciones',
  templateUrl: './terminoscondiciones.component.html',
  styleUrls: ['./terminoscondiciones.component.scss'],
})
export class TerminoscondicionesComponent  implements OnInit {

  @Input()
  pdfUrl!: string;

  constructor(private modalController: ModalController) {}



  ngOnInit() {
    console.log("df ", this.pdfUrl)
  }

  cerrar() {
    this.modalController.dismiss();
  }

}
