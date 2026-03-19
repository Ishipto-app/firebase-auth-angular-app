import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../../code/auth/auth.service';
import {Router, RouterModule} from '@angular/router';
import {Auth, reload} from '@angular/fire/auth';

@Component({
  selector: 'app-user-verify',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './user-verify.html',
  styleUrl: './user-verify.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserVerify {
  private authService = inject(AuthService);
  private router = inject(Router);
  private auth = inject(Auth);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  user$ = this.authService.user$;

  async checkVerification() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const user = this.auth.currentUser;
      if (user) {
        await reload(user);
        if (user.emailVerified) {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage.set('Email của bạn vẫn chưa được xác thực. Vui lòng kiểm tra hộp thư.');
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      this.errorMessage.set(err.message || 'Có lỗi xảy ra khi kiểm tra xác thực.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendEmail() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const user = this.auth.currentUser;
      if (user) {
        // We can't use authService.signUp because that creates a new user.
        // We need a method in AuthService or just call sendEmailVerification directly if imported.
        // But sendEmailVerification is already imported in AuthService.
        // For simplicity, I'll just use the Firebase Auth instance directly here if allowed, 
        // but better to have it in AuthService.
        // Actually, I'll just call the Firebase API directly here for now.
        const { sendEmailVerification } = await import('@angular/fire/auth');
        await sendEmailVerification(user);
        this.errorMessage.set('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.');
      }
    } catch (error: unknown) {
      const err = error as Error;
      this.errorMessage.set(err.message || 'Có lỗi xảy ra khi gửi lại email.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
