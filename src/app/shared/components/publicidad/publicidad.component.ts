import { Component, OnInit } from '@angular/core';
import User from 'onesignal-cordova-plugin/dist/UserNamespace';
import { UserService } from 'src/app/core/services/user.service';
@Component({
  selector: 'app-publicidad',
  templateUrl: './publicidad.component.html',
  styleUrls: ['./publicidad.component.scss'],
})
export class PublicidadComponent  implements OnInit {
  publicidades: any= [];
  currentPublicidad: any;
  currentIndex = 0;
  intervalId: any;

  constructor(private api: UserService) { }

  ngOnInit() {
    this.getPublicidad();
  }

  async getPublicidad(){
    try {
        const response = await this.api.getPublicidad();
        response.subscribe((re)=>{
          this.publicidades = re.result;
          this.currentIndex = (this.currentIndex + 1) % this.publicidades.length;
          this.currentPublicidad = this.publicidades[this.currentIndex];
          
          this.intervalId = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.publicidades.length;
            this.currentPublicidad = this.publicidades[this.currentIndex];
          }, 5000); // cambia cada 5 segundos
        })
    } catch (error) {
      
    }
  }

  abrirPublicidad() {
  if (this.currentPublicidad?.href
) {
    window.open(this.currentPublicidad.href
, '_blank');
  }
}

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

}
