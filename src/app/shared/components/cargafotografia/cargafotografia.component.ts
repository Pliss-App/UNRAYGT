import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cargafotografia',
  templateUrl: './cargafotografia.component.html',
  styleUrls: ['./cargafotografia.component.scss'],
})
export class CargafotografiaComponent  implements OnInit {
  @Input() imageSrc: string | null = null;
  @Input() label: string = 'Tomar Foto';
  @Output() photoClick = new EventEmitter<void>();
  constructor() {  console.log("ESTO DENTRO ")}

  ngOnInit() {
    console.log("ESTO DENTRO ")
  }
  



  handleClick() {
    this.photoClick.emit();
  }
}
