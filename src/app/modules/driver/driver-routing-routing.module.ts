import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),    canActivate: [AuthGuard] }, // Protección de ruta },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
  { path: 'documentacion', loadChildren: () => import('./pages/documentacion/documentacion.module').then(m => m.DocumentacionPageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
  { path: 'recargar', loadChildren: () => import('./pages/recargar-billetera/recargar-billetera.module').then(m => m.RecargarBilleteraPageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
 
  { path: '', redirectTo: 'home', pathMatch: 'full'},   {path: 'travel-route',loadChildren: () => import('./pages/travel-route/travel-route.module').then( m => m.TravelRoutePageModule),  canActivate: [AuthGuard]
  },
  {path: 'calificar',loadChildren: () => import('./pages/calificar/calificar.module').then( m => m.CalificarPageModule)},
  {path: 'historial',loadChildren: () => import('./pages/historial/historial.module').then( m => m.HistorialPageModule),  canActivate: [AuthGuard] },
  {path: 'historial-billetera', loadChildren: () => import('./pages/historial-billetera/historial-billetera.module').then( m => m.HistorialBilleteraPageModule),  canActivate: [AuthGuard] },
  {path: 'seguridad', loadChildren: () => import('./pages/seguridad/seguridad.module').then( m => m.SeguridadPageModule)},
  {
    path: 'configuracion/aplicacion',
    loadChildren: () => import('./pages/aplicacion/aplicacion.module').then( m => m.AplicacionPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'configuracion/politicas',
    loadChildren: () => import('./pages/politicas/politicas.module').then( m => m.PoliticasPageModule) ,canActivate: [AuthGuard]
  },
  {
    path: 'soporte',
    loadChildren: () => import('./pages/soporte/soporte.module').then( m => m.SoportePageModule), canActivate: [AuthGuard]
  },
  {
    path: 'configuracion',
    loadChildren: () => import('./pages/configuracion/configuracion.module').then( m => m.ConfiguracionPageModule) ,canActivate: [AuthGuard]
  },
  {
    path: 'ayuda',
    loadChildren: () => import('./pages/ayuda/ayuda.module').then( m => m.AyudaPageModule) ,canActivate: [AuthGuard]
  },
  {
    path: 'soporte/formulario',
    loadChildren: () => import('./pages/formulario/formulario.module').then( m => m.FormularioPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'billetera',
    loadChildren: () => import('./pages/billetera/billetera.module').then( m => m.BilleteraPageModule)
  },
  {
    path: 'ayuda/problemaosugerencia',
    loadChildren: () => import('./pages/problemaosugerencia/problemaosugerencia.module').then( m => m.ProblemaosugerenciaPageModule)
  },
  {
    path: 'ayuda/preguntasfrecuentes',
    loadChildren: () => import('./pages/preguntasfrecuentes/preguntasfrecuentes.module').then( m => m.PreguntasfrecuentesPageModule)
  },
  {
    path: 'detalles-cuenta',
    loadChildren: () => import('./pages/detalles-cuenta/detalles-cuenta.module').then( m => m.DetallesCuentaPageModule)
  },
  {
    path: 'detalle-ganancia',
    loadChildren: () => import('./pages/detalle-ganancia/detalle-ganancia.module').then( m => m.DetalleGananciaPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./pages/notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'afiliacion/:idusuario',
    loadChildren: () => import('./pages/afiliacion/afiliacion.module').then( m => m.AfiliacionPageModule),canActivate: [AuthGuard]
  },
  {
    path: 'referidos',
    loadChildren: () => import('./pages/referidos/referidos.module').then( m => m.ReferidosPageModule)
  },
// Protección de ruta }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingRoutingModule { }
