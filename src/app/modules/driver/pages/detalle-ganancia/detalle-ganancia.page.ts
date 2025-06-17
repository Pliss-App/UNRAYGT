import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConductorService } from 'src/app/core/services/conductor.service';

@Component({
  selector: 'app-detalle-ganancia',
  templateUrl: './detalle-ganancia.page.html',
  styleUrls: ['./detalle-ganancia.page.scss'],
})
export class DetalleGananciaPage implements OnInit {
  user: any = null;
  userRole: any;
  fecha: any = this.getCurrentDate(); // this.getCurrentDate();
  listado: any = [];
  totalGanancia: number = 0;

selectedDate: string = new Date().toISOString().split('T')[0];
hoy: string = new Date().toISOString().split('T')[0];
// showDatePicker = false;

  fechaHoy: string = new Date().toISOString();
  //selectedDate: string = new Date().toISOString();
// selectedDate: any = ''; // Fecha por defecto
  showDatePicker: boolean = false; // Controla la visibilidad del calendario

  constructor(private api: ConductorService,
    private auth: AuthService,
    private menuController: MenuController,
    private navCtrl: NavController) {

    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
    this. getFechaHoy();
  }

  ngOnInit() {
    this.getHistorial();
  }

  ionViewWillEnter() {
  this.resetVista();
}

resetVista() {
  this.fecha = this.getCurrentDate();              // ddMMyyyy
  this.selectedDate = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
  this.totalGanancia = 0;
  this.listado = [];
  this.showDatePicker = false;

  this.getHistorial(); // Cargar nuevamente los datos del día
}
  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }



  async getHistorial() {
    try {
      this.listado = [];
      const response = await this.api.historialGananciasDriver(this.user.idUser, this.fecha).toPromise();
      if (response.success) {
        this.listado = response.result;
        this.sumarGanancias();
      }
    } catch (error) {
      alert("Erro durante la busqueda. Intenta más tarde")
    }
  }

  sumarGanancias() {
    // Usamos reduce para sumar las ganancias
    this.totalGanancia = this.listado.reduce((acc: number, item: any) => {
      return acc + item.ganancia;
    }, 0); // Inicializamos el acumulador en 0
  }


  toggleDatePicker() {
    this.showDatePicker = !this.showDatePicker;
  }

  getFechaHoy() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const day = String(fecha.getDate()).padStart(2, '0');

    this.selectedDate= `${year}-${month}-${day}`;
  }

  onDateChange(event: any) {
    const value = event.detail.value;  // Obtener el valor del evento (fecha seleccionada)
    var year = value.slice(1 - 1, 4);
    var month = value.slice(6 - 1, 7);
    var day = value.slice(9 - 1, 10)
    // Actualizar las fechas en formato adecuado
    this.selectedDate = `${year}-${month}-${day}`; // Fecha en formato YYYY-MM-DD
    this.fecha = `${day}${month}${year}`; // Fecha en formato DDMMYYYY

    if (this.fecha) {
      this.getHistorial();
    }
    this.showDatePicker = false; // Oculta el calendario después de elegir una fecha
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0'); // Obtiene el día con 2 dígitos
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes con 2 dígitos
    const year = now.getFullYear().toString(); // Obtiene el año

    return `${day}${month}${year}`;
  }


  formatearFecha(fecha: string): string {
  if (fecha.length !== 8) return fecha; // por si viene mal
  const dia = fecha.slice(0, 2);
  const mes = fecha.slice(2, 4);
  const anio = fecha.slice(6, 8); // solo últimos dos dígitos
  return `${dia}-${mes}-${anio}`;
}

formatearHora(hora: string): string {
  if (hora.length !== 6) return hora;
  const h = hora.slice(0, 2);
  const m = hora.slice(2, 4);
  const s = hora.slice(4, 6);
  return `${h}:${m}:${s}`;
}
}
