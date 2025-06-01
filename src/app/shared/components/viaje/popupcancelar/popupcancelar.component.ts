import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedService } from 'src/app/core/services/shared.service';


@Component({
  selector: 'app-popupcancelar',
  templateUrl: './popupcancelar.component.html',
  styleUrls: ['./popupcancelar.component.scss'],
})
export class PopupcancelarComponent implements OnInit {

  @Input() isOpen: boolean = false;
  @Input() title: string = 'Selecciona una opción';
  @Input() options: { title: string; value: any }[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();
  presentingEl: HTMLElement | null = null;
  selectedOption: any = null;
submitted = false;
  otroTexto: string = '';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

  }


  ngAfterViewInit() {
    this.presentingEl = document.querySelector('ion-router-outlet');
    this.cdr.detectChanges(); // ← 🔥 Solución: fuerza actualización segura
  }
  closeModal() {
    this.isOpen = false;
    this.onClose.emit();
  }

save() {
  this.submitted = true;
  // Validar si eligió "otro" y no escribió texto
  if (this.selectedOption === 'otro' && (!this.otroTexto || this.otroTexto.trim().length < 1)) {
    return;
  }

  // Emitir el valor correspondiente
  const valor = this.selectedOption === 'otro' ? this.otroTexto.trim() : this.selectedOption;
  this.onSave.emit(valor);

  this.closeModal();
}


}
