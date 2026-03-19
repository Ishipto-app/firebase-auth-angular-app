import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../../code/auth/auth.service';
import {Router, RouterModule, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal(false);

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    ]],
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const password = params['password'];

      if (email) this.authForm.patchValue({ email });
      if (password) this.authForm.patchValue({ password });
    });
  }

  async onRegister() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.authForm.value;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      // Create user immediately on Firebase Authentication
      await this.authService.signUp(email!, password!);
      
      this.successMessage.set('Đăng ký thành công! Một email xác thực đã được gửi đến địa chỉ của bạn. Vui lòng kiểm tra hộp thư.');
      
      // Navigate to verification page
      setTimeout(() => {
        this.router.navigate(['/user-verify']);
      }, 3000);
    } catch (error: unknown) {
      const err = error as Error;
      this.errorMessage.set(err.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
