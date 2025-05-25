import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { SharedService } from 'src/app/core/services/shared.service';


@Component({
  selector: 'app-popupcancelar',
  templateUrl: './popupcancelar.component.html',
  styleUrls: ['./popupcancelar.component.scss'],
})
export class PopupcancelarComponent  implements OnInit {

  @Input() isOpen: boolean = false;
  @Input() title: string = 'Selecciona una opción';
  @Input() options: { title: string; value: any }[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  selectedOption: any = null;

  ngOnInit() {

  }

  closeModal() {
    this.isOpen = false;
    this.onClose.emit();
  }

  save() {
    this.onSave.emit(this.selectedOption);
    this.closeModal();
  }


}
