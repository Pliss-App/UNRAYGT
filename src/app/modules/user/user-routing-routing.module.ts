import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { TravelGuard } from 'src/app/core/guards/travel.guard';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),    canActivate: [AuthGuard , TravelGuard] }, // Protección de ruta },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
  { path: '', redirectTo: 'home', pathMatch: 'full'},   {
    path: 'travel-route',
    loadChildren: () => import('./pages/travel-route/travel-route.module').then( m => m.TravelRoutePageModule),  canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'calificar',
    loadChildren: () => import('./pages/calificar/calificar.module').then( m => m.CalificarPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./pages/historial/historial.module').then( m => m.HistorialPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'seguridad',
    loadChildren: () => import('./pages/seguridad/seguridad.module').then( m => m.SeguridadPageModule)
  },
  {
    path: 'ayuda',
    loadChildren: () => import('./pages/ayuda/ayuda.module').then( m => m.AyudaPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'configuracion',
    loadChildren: () => import('./pages/configuracion/configuracion.module').then( m => m.ConfiguracionPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'soporte',
    loadChildren: () => import('./pages/soporte/soporte.module').then( m => m.SoportePageModule), canActivate: [AuthGuard]
  },
  {
    path: 'soporte/formulario',
    loadChildren: () => import('./pages/formulario/formulario.module').then( m => m.FormularioPageModule), canActivate: [AuthGuard]
  }, 
  {
    path: 'configuracion/politicas',
    loadChildren: () => import('./pages/politicas/politicas.module').then( m => m.PoliticasPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'configuracion/aplicacion',
    loadChildren: () => import('./pages/aplicacion/aplicacion.module').then( m => m.AplicacionPageModule),canActivate: [AuthGuard]
  },
  {
    path: 'ayuda/preguntasfrecuentes',
    loadChildren: () => import('./pages/preguntasfrecuentes/preguntasfrecuentes.module').then( m => m.PreguntasfrecuentesPageModule)
  },
  {
    path: 'ayuda/problemaosugerencia',
    loadChildren: () => import('./pages/problemaosugerencia/problemaosugerencia.module').then( m => m.ProblemaosugerenciaPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./pages/notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'modoconductor/:idusuario',
    loadChildren: () => import('./pages/modoconductor/modoconductor.module').then( m => m.ModoconductorPageModule)
  },
  {
    path: 'afiliacion/:idusuario',
    loadChildren: () => import('./pages/afiliacion/afiliacion.module').then( m => m.AfiliacionPageModule),canActivate: [AuthGuard]
  },
  {
    path: 'referidos',
    loadChildren: () => import('./pages/referidos/referidos.module').then( m => m.ReferidosPageModule)
  },
  {
    path: 'cambiarmodo/:idusuario',
    loadChildren: () => import('./pages/cambiarmodo/cambiarmodo.module').then( m => m.CambiarmodoPageModule),canActivate: [AuthGuard]
  }









// Protección de ruta }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingRoutingModule { }
