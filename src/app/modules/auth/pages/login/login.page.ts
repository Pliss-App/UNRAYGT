import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credenciales!: FormGroup;

  constructor( private loadingController: LoadingController, private formBuilder: FormBuilder, private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.credenciales = this.formBuilder.group({
      user: ['', [Validators.required, Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    }
    );
  }

  isFieldInvalid(field: string): boolean {
    return (
      !!this.credenciales.get(field)?.invalid && !!this.credenciales.get(field)?.touched
    );
  }

  async onSubmit() {
    if (this.credenciales.invalid) return;

    const loading = await this.loadingController.create({
      message: 'Verificando credenciales...',
      spinner: 'circles',
      duration: 5000, // Puedes eliminar esto si quieres que el loading solo se cierre manualmente
    });

    await loading.present();
    setTimeout(async () => {
   
    if (this.credenciales.valid) {
      try {
       const credenciales = this.credenciales.value;
        const response = await this.auth.login(credenciales);
        response.subscribe(async (re) => {
         // console.log("DAOTO ", re);
          await loading.dismiss(); // Ocultar el loading
          this.clearForm();
          const userRole = this.auth.getRole();
          if (userRole === 'usuario') {
            this.router.navigate(['/']);
          } else if (userRole === 'driver') {
            this.router.navigate(['/driver/home']);
          }
        })
      } catch (error) {
        console.error("Error ", error)
      }
    } else {
      this.credenciales.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
    }
  }, 1000); 
  }

  clearForm() {
    this.credenciales.reset();
  }

 crear(item:any) {
  if(item == 'register'){
    this.router.navigate(['/auth/register']); // Navegar a la página de perfil
  }else{
    this.router.navigate(['/auth/recuperar-contrasenia']); 
  }}

  passwordType: string = 'password';

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

}
