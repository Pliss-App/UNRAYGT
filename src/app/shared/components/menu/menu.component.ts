import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {
  userRole: string = '';

  constructor(private authService: AuthService) {
    this.userRole = this.authService.getRole();
    console.log(this.userRole)
  }
  ngOnInit() {}

  isUser() {
    return this.userRole === 'usuario';
  }

  isDriver() {
    return this.userRole === 'driver';
  }


}
