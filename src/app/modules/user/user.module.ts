import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { ChatPageModule } from './pages/chat/chat.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule ,
    ReactiveFormsModule,
    ChatPageModule
  ],
  exports: [ ]
})
export class UserModule { }
