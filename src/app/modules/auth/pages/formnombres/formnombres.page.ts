import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
@Component({
  selector: 'app-formnombres',
  templateUrl: './formnombres.page.html',
  styleUrls: ['./formnombres.page.scss'],
})
export class FormnombresPage implements OnInit {
  registro!: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  user: any = null;

  constructor(private formBuilder: FormBuilder, private auth: AuthService, private api: UserService) {
    this.user = this.auth.getUser();
    this.registro = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
    })

  }

  ngOnInit() {
  }

  async onSubmit() {
    this.isLoading = true;
    if (this.registro.invalid) {
      this.registro.markAllAsTouched(); // Para mostrar errores
      return;
    }

    if (this.registro.valid) {
      this.isSubmitting = true;

      const data = {
        id: this.user.idUser,
        telefono: this.user.telefono,
        nombre: this.registro.value.nombre,
        apellido: this.registro.value.apellido
      }
      setInterval(async () => {

        const response = await this.api.updateNombreApellido(data);
        response.subscribe((re) => {
          this.isLoading = false;
          if (re.success) {
            this.auth.refreshLogin(re);
            window.location.reload(); // 🔄 Recarga la página al presionar "OK"

          }
        })

      }, 3000)
    }
  }

  isFieldInvalid(field: string): boolean {
    return (
      !!this.registro.get(field)?.invalid && !!this.registro.get(field)?.touched
    );
  }

}
