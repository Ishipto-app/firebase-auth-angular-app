import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {RouterModule} from '@angular/router';
import {AuthService} from '../../../code/auth/auth.service';

@Component({
  selector: 'app-page-permission',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './page-permission.html',
  styleUrl: './page-permission.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePermission {
  authService = inject(AuthService);
}
