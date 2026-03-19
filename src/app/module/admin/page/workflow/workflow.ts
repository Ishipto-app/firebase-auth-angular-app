import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../../../code/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-workflow',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './workflow.html',
  styleUrl: './workflow.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Workflow {
  authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    this.router.navigate(['/logout']);
  }
}
