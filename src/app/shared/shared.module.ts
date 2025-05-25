import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MapComponent } from './components/map/map.component';
import { MapaComponent } from './components/conductor/mapa/mapa.component';
import { AlertfaceComponent } from './components/alertface/alertface.component';
import { BilleteraComponent } from './components/conductor/billetera/billetera.component';
import { UserDriverComponent } from './components/viaje/user-driver/user-driver.component';
import { ViajeSheetComponent } from './components/viaje/viaje-sheet/viaje-sheet.component';
import { MenuComponent } from './components/menu/menu.component';
import { FotoComponent } from './components/foto/foto.component';
import { FotoMenuComponent } from './components/foto-menu/foto-menu.component';
import { PopupcancelarComponent } from './components/viaje/popupcancelar/popupcancelar.component';
import { MapRoutingComponent } from './components/map-routing/map-routing.component';
import { BottomSheetComponent } from './components/bottom-sheet/bottom-sheet.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TerminoscondicionesComponent } from './components/terminoscondiciones/terminoscondiciones.component';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { SearchDirectionComponent } from './components/search-direction/search-direction.component';
import { CalificacionComponent } from './components/calificacion/calificacion.component';
import { CapitalizeNamePipe } from './pipes/capitalize-name.pipe';
import { AlertregistroComponent } from './components/alertregistro/alertregistro.component';
import { AlertverificationComponent } from './components/alertverification/alertverification.component';
import { PublicidadComponent } from './components/publicidad/publicidad.component';
import { ReferidosComponent } from './components/referidos/referidos.component';
import { SafePipe } from './pipes/safe.pipe';
import { CargafotografiaComponent } from './components/cargafotografia/cargafotografia.component';

@NgModule({
  declarations: [PopupcancelarComponent, CargafotografiaComponent, TerminoscondicionesComponent , ReferidosComponent , SafePipe, PublicidadComponent, CapitalizeNamePipe, AlertverificationComponent, AlertregistroComponent, AlertfaceComponent , FotoMenuComponent , MapComponent,ViajeSheetComponent, CalificacionComponent , UserDriverComponent, MapRoutingComponent, MapaComponent, MenuComponent,  BottomSheetComponent, BilleteraComponent, SearchDirectionComponent, FotoComponent],
  imports: [CommonModule, IonicModule,    FormsModule,  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PopupcancelarComponent, CargafotografiaComponent, TerminoscondicionesComponent , ReferidosComponent , PublicidadComponent, FotoMenuComponent, AlertverificationComponent, AlertregistroComponent, AlertfaceComponent , MapComponent, ViajeSheetComponent,CalificacionComponent , UserDriverComponent, MapRoutingComponent, MapaComponent, MenuComponent, BilleteraComponent, BottomSheetComponent, SearchDirectionComponent, FotoComponent] // Exporta el componente para usarlo en otros módulos
})
export class SharedModule {}
