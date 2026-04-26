import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { Button } from '../button/button';
import { AuthInput } from '../auth-input/auth-input';
import { AuthMode, AuthToggle } from '../auth-toggle/auth-toggle';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-auth-form',
  imports: [CommonModule, RouterLink, Button, AuthInput, AuthToggle],
  templateUrl: './auth-form.html',
  styleUrl: './auth-form.css',
})
export class AuthForm {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected mode: AuthMode = 'login';

  protected username = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';

  protected readonly error = signal('');
  protected readonly isSubmitting = signal(false);

  protected setMode(mode: AuthMode): void {
    this.mode = mode;
    this.clearFields();
    this.error.set('');
  }

  protected submit(): void {
    this.error.set('');
    if (this.mode === 'login') {
      this.submitLogin();
      return;
    }
    this.submitRegister();
  }

  protected handleGoogleClick(): void {
    this.error.set('Google sign-in is not implemented yet #TODO');
  }

  private clearFields(): void {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  private submitLogin(): void {
    const username = this.username.trim();
    const password = this.password;
    if (!username || !password) {
      this.error.set('Enter your username and password.');
      return;
    }

    this.isSubmitting.set(true);
    this.auth
      .login({ username, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.show('Signed in successfully.');
          this.navigateAfterAuth();
        },
        error: (err: Error) => this.error.set(err.message),
      });
  }

  private submitRegister(): void {
    const username = this.username.trim();
    const email = this.email.trim();
    const password = this.password;
    const confirm = this.confirmPassword;

    if (!username || !email || !password || !confirm) {
      this.error.set('Fill in all fields.');
      return;
    }

    if (password !== confirm) {
      this.error.set('Passwords must match.');
      return;
    }

    this.isSubmitting.set(true);
    this.auth
      .register({ username, email, password })
      .pipe(
        switchMap(() => this.auth.login({ username, password })),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('Account created. Signed in successfully.');
          this.navigateAfterAuth();
        },
        error: (err: Error) => this.error.set(err.message),
      });
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      void this.router.navigateByUrl(returnUrl);
      return;
    }
    void this.router.navigate(['/game']);
  }
}
