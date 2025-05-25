import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './core/guards/role.guard';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  { path: 'user', loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'usuario' }},
  { path: 'driver', loadChildren: () => import('./modules/driver/driver.module').then(m => m.DriverModule), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'conductor' }},
  { path: '**', redirectTo: 'auth' },
  {
    path: 'recargar-billetera',
    loadChildren: () => import('./modules/driver/pages/recargar-billetera/recargar-billetera.module').then( m => m.RecargarBilleteraPageModule)
  },
  {
    path: 'recuperar',
    loadChildren: () => import('./modules/auth/pages/recuperar/recuperar.module').then( m => m.RecuperarPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
