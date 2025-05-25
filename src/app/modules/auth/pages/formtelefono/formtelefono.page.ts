import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-formtelefono',
  templateUrl: './formtelefono.page.html',
  styleUrls: ['./formtelefono.page.scss'],
})
export class FormtelefonoPage implements OnInit {
  phoneNumber: string = '';
  isLoading = false;

  countries = [
    { name: 'GT', code: '502', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Flag_of_Guatemala.svg/1280px-Flag_of_Guatemala.svg.png' }
    // Agrega más países según necesites
  ];
  selectedCountry = this.countries[0];
  constructor(private api: AuthService, private router: Router) { }

  ngOnInit() {
  }

  async submitPhone() {
    this.isLoading = true;
    const fullNumber = this.selectedCountry?.code + this.phoneNumber;
    const data = {
      telefono: this.phoneNumber,
      codigo: this.selectedCountry?.code,
      fecha: this.obtenerFechaHoraLocal()
    }

    try {
      const response = await this.api.loginTelefono(data).toPromise();
      this.isLoading = false; // Oculta el loading al finalizar
    } catch (error) {

    }
    //    console.log('Teléfono completo:', fullNumber);
    // Aquí llamas tu API o lógica
  }


  obtenerFechaHoraLocal(): string {
    const now = new Date();
    return now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");
  }

}
