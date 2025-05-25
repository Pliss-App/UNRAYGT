import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alertface',
  templateUrl: './alertface.component.html',
  styleUrls: ['./alertface.component.scss'],
})
export class AlertfaceComponent  {

  @Input() message: string | undefined;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
