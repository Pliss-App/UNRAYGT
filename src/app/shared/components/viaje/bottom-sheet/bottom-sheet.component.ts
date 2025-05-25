import { Component, ElementRef, Renderer2, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
})
export class BottomSheetComponent  implements OnInit {

  @Input() minHeight: number = 100; // Altura mínima en píxeles
  @Input() maxHeight: number = 400; // Altura máxima en píxeles

  private currentHeight: number = this.minHeight;
  private startY: number = 0;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit() {
  }
  
  onTouchStart(event: TouchEvent) {
    this.startY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent) {
    const touchY = event.touches[0].clientY;
    const deltaY = this.startY - touchY;
    const newHeight = this.currentHeight + deltaY;

    if (newHeight >= this.minHeight && newHeight <= this.maxHeight) {
      this.currentHeight = newHeight;
      this.renderer.setStyle(this.el.nativeElement.querySelector('.bottom-sheet'), 'height', `${this.currentHeight}px`);
    }

    this.startY = touchY;
  }

  onTouchEnd() {
    // Se podría agregar lógica adicional aquí si se desea ajustar el movimiento final
  }

}
