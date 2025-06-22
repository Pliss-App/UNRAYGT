import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonDatetime, MenuController, ModalController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConductorService } from 'src/app/core/services/conductor.service';
import { DetallesCuentaPage } from '../detalles-cuenta/detalles-cuenta.page';

@Component({
  selector: 'app-billetera',
  templateUrl: './billetera.page.html',
  styleUrls: ['./billetera.page.scss'],
})
export class BilleteraPage implements OnInit {
  @ViewChild('fechaInicioPicker', { static: false }) fechaInicioPicker!: IonDatetime;
  @ViewChild('fechaFinPicker', { static: false }) fechaFinPicker!: IonDatetime;
  filtroFecha: string = '';
  saldo: number = 0;
  isLoading = false;
  movimientos: any = [];
  userRole: any;
  user: any = null;
  filtroTipo: string = ''; // Tipo de transacción seleccionado
  fechaInicio: string = '';
  fechaFin: string = '';
  movimientosFiltrados: any = [];
  activarFiltroFecha: boolean = false;
  saldoMinimo: any = 0;
  constructor(private api: UserService, private apiConductor: ConductorService, public actionSheetController: ActionSheetController,
    private auth: AuthService, private menuController: MenuController, private modalCtrl: ModalController,
    private navCtrl: NavController, private alertController: AlertController) {

    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
    this.getSaldoBloqueoViaje();
  }



  ngOnInit() {
    this.getSaldo();
    this.getMovimientos()
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  getSaldo() {
    this.isLoading = true;

    this.api.getSaldo(this.user.idUser).subscribe({
      next: (re) => {
        if (re.result) {
          const data = re.result;
          this.saldo = data.saldo;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener saldo:', err);
        this.isLoading = false;
      }
    });
  }

  getMovimientos() {
    this.isLoading = true;
    try {
      this.apiConductor.getMovimientos(this.user.idUser).subscribe((re) => {
        if (re.result) {
          const data = re.result;
          this.movimientos = data;
          this.movimientosFiltrados = [...this.movimientos];

          this.isLoading = false;
        }
      })
    } catch (error) {
      console.error(error);
      this.isLoading = false;
    }
  }


  filtrarMovimientos() {
    this.movimientosFiltrados = this.movimientos.filter((mov: any) => {
      const cumpleTipo = this.filtroTipo ? mov.tipo === this.filtroTipo : true;
      const cumpleFechaInicio = this.fechaInicio ? new Date(mov.fecha) >= new Date(this.fechaInicio) : true;
      return cumpleTipo && cumpleFechaInicio
    });

    this.movimientosFiltrados = this.movimientosFiltrados.reverse();
  }



  getFecha(item: any) {
    // Suponiendo que `movimiento.fecha` está en formato UTC
    let fechaUtc = new Date(item);

    // Convertir a la zona horaria local
    let fechaLocal = new Date(fechaUtc.toLocaleString());

    // Asignar a la propiedad que se usará en el HTML
    return fechaLocal;
  }



  async navigateToPayments() {

    this.mostrarDetallesCuenta();
    /*
    const actionSheet = await this.actionSheetController.create({
      header: 'Métodos de Pago',  // Título del Action Sheet
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      cssClass: 'alert-metodos-pagos',  // Clase CSS personalizada para el estilo
      buttons: [
     /*   {
          text: 'VisaLink',  // Opción para VisaLink
          icon: 'card',  // Icono para VisaLink (puedes elegir otro)
          handler: () => {
            console.log('VisaLink clicked');
            this.openVisaLink();  // Llama a tu función correspondiente
          },
        },
        {
          text: 'Depósito Bancario',  // Opción para Depósito Bancario
          icon: 'business',  // Icono para Depósito Bancario
          handler: () => {
            console.log('Depósito Bancario clicked');
            this.mostrarDetallesCuenta();  // Llama a tu función correspondiente
          },
        },
        {
          text: 'Cancelar',  // Opción para Cancelar
          icon: 'close',  // Icono de cancelación
          role: 'cancel',  // Establece el rol de cancelación
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
  
    await actionSheet.present();
  
    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role); */
  }


  async mostrarDetallesCuenta() {
    const modal = await this.modalCtrl.create({
      component: DetallesCuentaPage,
      cssClass: 'custom-alert-modal-billetera', // Clase CSS personalizada
      backdropDismiss: false, // Opcional: evita que se cierre al hacer clic fuera del modal
    });

    await modal.present();
  }



  async getSaldoBloqueoViaje() {
    try {
      await this.apiConductor.getSaldoMinimo().subscribe(async (res: any) => {
        if (res.success) {
          const data = res.result;
          this.saldoMinimo = data.saldo;
        }
      })
    } catch (error) {
      console.error(error)
    }

  }
}
