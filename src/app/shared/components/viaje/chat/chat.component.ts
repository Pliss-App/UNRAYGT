import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent  implements OnInit {

  constructor(private modalController: ModalController, private uSer: UserService) {}

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {}

}
