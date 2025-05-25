import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alertverification',
  templateUrl: './alertverification.component.html',
  styleUrls: ['./alertverification.component.scss'],
})
export class AlertverificationComponent implements OnInit {
  @Input() message: string | undefined;

  constructor(private modalCtrl: ModalController) { }
  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
