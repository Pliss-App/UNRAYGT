import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-cambiarmodo',
  templateUrl: './cambiarmodo.page.html',
  styleUrls: ['./cambiarmodo.page.scss'],
})
export class CambiarmodoPage implements OnInit {
  servicios: any = [];
  user: any;
  isLoading = true;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private api: UserService,
    private router: Router) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.getServicios()
  }

  async getServicios() {

    try {
      setTimeout(async () => {
        const res = await this.api.getServicioModo().toPromise();
        if (res.success === true) {
          this.servicios = res.result;
        }
        this.isLoading = false;
      }, 2000);
    } catch (error) {
    }


  }


  async seleccionarServicio(card: any) {
    console.log("ENTERACR COMO ", card)

    try {
      const data = {
        idUser: this.user.idUser,
        telefono: this.user.telefono
      }

      const result = await this.api.loginRolModo(data).toPromise();

      if (result.success != true) {
        console.log("Ocurrio un error,");
      }
    } catch (error) {

    }
  }

  irCrear() {
    this.router.navigate([`/user/afiliacion/${this.user.idUser}`]);
  }

  goBack() {
    this.navCtrl.back();
  }

}
