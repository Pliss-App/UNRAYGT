import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConductorService } from 'src/app/core/services/conductor.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  username: any = null;
  user: any = null;
  profileForm!: FormGroup;
  isUpdateButtonDisabled: boolean = true;
  userRole: any;
  vehiculo: any = null;
  rating: any = null;
  saldo: any = null;
  ganancia: any = null;
  stars: string[] = [];
  fecha: any = null;

  constructor(private fb: FormBuilder,
    private apiCond: ConductorService,
    private auth: AuthService,
    private api: UserService,
    private toastController: ToastController,
    private authService: AuthService,
    private menuController: MenuController) {
    this.userRole = this.auth.getRole();
    this.fecha = this.getCurrentDate();
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      nombre: [''],        // Campo de nombre
      apellido: [''],    // Campo de apellido
      telefono: [''],       // Campo de teléfono
      correo: [''],       // Campo de correo
    });
    this.profileForm.markAsPristine();
    this.profileForm.valueChanges.subscribe(() => {
      // Habilita el botón de actualizar si el formulario cambió, de lo contrario lo desactiva
      this.isUpdateButtonDisabled = this.profileForm.pristine;
    });
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getRole();

    if (isAuthenticated) {
      this.user = this.authService.getUser();
      this.username = this.user.nombre + " " + this.user.apellido;
      this.getVehiculo();
      this.getRating();
      this.getSaldo();
      this.getGanancias();
    }

  }

  getGanancias() {
    try {

      this.apiCond.gananciasDriver(this.user.idUser, this.fecha).subscribe((re) => {
        if (re.result) {

          const data = re.result;
          this.ganancia = data.ganancia;
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  getSaldo() {

    try {
      this.api.getSaldo(this.user.idUser).subscribe((re) => {
        if (re.result) {
          const data = re.result;
          this.saldo = data.saldo;

        }
      })
    } catch (error) {
      console.error(error);

    }
  }

  async getVehiculo() {
    try {
      const response = await this.apiCond.getDetalleVehiculo(this.user.idUser).toPromise();
      if (response.success) {

        this.vehiculo = response.result;
      }
    } catch (error) {
      alert(error)
    }
  }

  async updateProfile(): Promise<void> {
    if (this.profileForm.valid) {
      const toast = await this.toastController.create({
        message: 'Actualizando datos...',
        duration: 2000,
        position: 'top',
        color: 'dark',
      });
      await toast.present();

      try {
        const response = this.api.updateUserProfile(this.user.idUser, this.profileForm.value);
        response.subscribe(async (re) => {
          if (re && re.token) {
            const successToast = await this.toastController.create({
              message: '¡Datos actualizados correctamente!',
              duration: 2000,
              color: 'success',
              position: 'top',
            });
            await successToast.present();
            this.username = re.user?.nombre + " " + re.user?.apellido;
            this.user = re.user;
            this.authService.refreshLogin(re);
            this.profileForm.markAsPristine();
            this.isUpdateButtonDisabled = true;

          }
          else {
            const errorToast = await this.toastController.create({
              message: 'Hubo un problema al actualizar los datos.',
              duration: 2000,
              color: 'danger',
              position: 'top',
            });
            await errorToast.present();
          }

        })
      } catch (error) {
        // Manejo de errores en caso de fallo en la llamada a la API
        const errorToast = await this.toastController.create({
          message: 'Error de conexión. No se pudo actualizar.',
          duration: 2000,
          color: 'danger',
          position: 'top',
        });
        await errorToast.present();

      }
    }
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  getRating() {

    try {
      this.api.getRating(this.user.idUser).subscribe((re) => {
        if (re.msg == 'SUCCESSFULLY') {
          this.rating = re.result;

          this.updateStars(this.rating.rating);
          return 0;
        } else {
          return 1;
        }
      })
    } catch (error) {
      console.log("error consultando Rating")
    }

  }

  updateStars(valor: number) {
    this.stars = Array(5)
      .fill('star-outline')
      .map((_, i) => {
        if (i < Math.floor(valor)) {
          return 'star'; // Estrella llena
        } else if (i < valor) {
          return 'star-half'; // Estrella a la mitad
        } else {
          return 'star-outline'; // Estrella vacía
        }
      });
  }

  copiarCodigo(codigo: string) {
    if (!codigo) {
      console.log("No hay código para copiar.");
      return;
    }
  
    navigator.clipboard.writeText(codigo).then(() => {
      console.log("Código copiado:", codigo);
    }).catch(err => {
      console.error("Error al copiar:", err);
    });
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0'); // Obtiene el día con 2 dígitos
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes con 2 dígitos
    const year = now.getFullYear().toString(); // Obtiene el año

    return `${day}${month}${year}`;
  }
}
