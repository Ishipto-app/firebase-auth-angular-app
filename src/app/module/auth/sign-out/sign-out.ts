import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {AuthService} from '../../../code/auth/auth.service';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-sign-out',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './sign-out.html',
  styleUrl: './sign-out.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignOut implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    // Perform logout when the component is loaded
    await this.authService.signOut();
    this.router.navigate(['/home']);
  }
}
