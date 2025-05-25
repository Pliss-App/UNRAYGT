import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alertregistro',
  templateUrl: './alertregistro.component.html',
  styleUrls: ['./alertregistro.component.scss'],
})
export class AlertregistroComponent  implements OnInit {
  @Input() message: string | undefined;

  constructor(private modalCtrl: ModalController,  private router: Router) { }
  
  ngOnInit() { }

  dismiss() {
   this.modalCtrl.dismiss();
   this.router.navigate(['/auth/verification-register'], { replaceUrl: true });
  }

}
