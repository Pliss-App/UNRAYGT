import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConductorService } from 'src/app/core/services/conductor.service';

@Component({
  selector: 'app-billetera',
  templateUrl: './billetera.component.html',
  styleUrls: ['./billetera.component.scss'],
})
export class BilleteraComponent implements OnInit {
  user: any = {}
  saldo: any = null;
  isLoading = false;
  fecha: any= null;
  
  constructor(private api: ConductorService , private auth: AuthService, private router: Router) {
    this.user = this.auth.getUser();
    this.fecha =this. getCurrentDate(); 
  }

  ngOnInit() {
    this.getGanancias();
  //  this.getConsulta();
  }

  getConsulta(){
    setInterval(() => {
      this.getGanancias();
    }, 60000);
  }

  getGanancias() {
    this.isLoading = true;
    try {
      this.api.gananciasDriver(this.user.idUser, this.fecha).subscribe((re) => {
        if (re.result) {
          let data = re.result;
          this.saldo = data?.ganancia;
          this.isLoading = false;
        }
      })
    } catch (error) {
      console.error(error);
      this.isLoading = false;
    }
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0'); // Obtiene el día con 2 dígitos
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes con 2 dígitos
    const year = now.getFullYear().toString(); // Obtiene el año
  
    return `${day}${month}${year}`;
  }

  recargar() {
    this.router.navigate(['/driver/recargar']); // Navegar a la página de perfil

    // this.router.navigate(['recargar']);
  }

}
