import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule) },
  { path: 'recuperar-contrasenia', loadChildren: () => import('./pages/recuperar/recuperar.module').then(m => m.RecuperarPageModule) },
  { path: '', redirectTo: 'formtelefono', pathMatch: 'full' },
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'verificacion/:telefono',
    loadChildren: () => import('./pages/verificacion/verificacion.module').then( m => m.VerificacionPageModule)
  },
  {
    path: 'offline',
    loadChildren: () => import('./pages/offline/offline.module').then( m => m.OfflinePageModule)
  },
  {
    path: 'verification-register/:telefono',
    loadChildren: () => import('./pages/verification-register/verification-register.module').then( m => m.VerificationRegisterPageModule)
  },
  {
    path: 'permissionlocation',
    loadChildren: () => import('./pages/permissionlocation/permissionlocation.module').then( m => m.PermissionlocationPageModule)
  },

  {
    path: 'formtelefono',
    loadChildren: () => import('./pages/formtelefono/formtelefono.module').then( m => m.FormtelefonoPageModule)
  },
  {
    path: 'formperfil',
    loadChildren: () => import('./pages/formperfil/formperfil.module').then( m => m.FormperfilPageModule)
  },
  {
    path: 'formnombres',
    loadChildren: () => import('./pages/formnombres/formnombres.module').then( m => m.FormnombresPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingRoutingModule { }
