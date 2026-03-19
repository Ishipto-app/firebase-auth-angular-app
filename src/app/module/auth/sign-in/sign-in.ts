import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../../code/auth/auth.service';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignIn {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authService = inject(AuthService);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit() {
    if (this.authForm.invalid) return;

    const { email, password } = this.authForm.value;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const result = await this.authService.signInByEmail(email!, password!);
      if (result.user.emailVerified) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/user-verify']);
      }
    } catch (error: unknown) {
      const err = error as Error;
      this.errorMessage.set(err.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithGoogle() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.signIn();
      this.router.navigate(['/home']);
    } catch (error: unknown) {
      const err = error as Error;
      this.errorMessage.set(err.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
