import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { Button } from '../button/button';
import { AuthInput } from '../auth-input/auth-input';
import { AuthMode, AuthToggle } from '../auth-toggle/auth-toggle';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../environments/environment';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GooglePromptMomentNotification {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
  }): void;
  prompt(listener?: (notification: GooglePromptMomentNotification) => void): void;
  cancel?: () => void;
}

interface GoogleIdentity {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
    __movieguessGoogleInitializedForClientId?: string;
  }
}

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
  private googleCredentialResolver: ((token: string) => void) | null = null;
  private googleCredentialRejecter: ((error: Error) => void) | null = null;

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
    this.error.set('');

    if (this.isSubmitting()) return;

    if (!environment.googleClientId) {
      this.error.set('Google login is not configured.');
      return;
    }

    this.isSubmitting.set(true);

    this.requestGoogleCredential()
      .then(token => this.auth.loginWithGoogle({ token }))
      .then(request$ => {
        request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
          next: () => {
            this.toast.show('Signed in with Google successfully.');
            this.navigateAfterAuth();
          },
          error: (err: Error) => this.error.set(err.message),
        });
      })
      .catch((err: Error) => {
        this.error.set(err.message);
        this.isSubmitting.set(false);
      });
  }

  private requestGoogleCredential(): Promise<string> {
    return new Promise((resolve, reject) => {
      const googleIdentity = window.google;
      if (!googleIdentity?.accounts?.id) {
        reject(new Error('Google Sign-In script is not loaded.'));
        return;
      }

      let isResolved = false;
      this.googleCredentialResolver = resolve;
      this.googleCredentialRejecter = reject;
      const timeoutId = window.setTimeout(() => {
        if (isResolved) return;
        isResolved = true;
        this.googleCredentialResolver = null;
        this.googleCredentialRejecter = null;
        reject(new Error('Google sign-in timed out. Please try again.'));
      }, 30000);

      if (window.__movieguessGoogleInitializedForClientId !== environment.googleClientId) {
        googleIdentity.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: response => {
            const credential = response.credential;
            if (!credential) {
              this.googleCredentialRejecter?.(new Error('Google did not return an ID token.'));
              this.googleCredentialResolver = null;
              this.googleCredentialRejecter = null;
              return;
            }
            this.googleCredentialResolver?.(credential);
            this.googleCredentialResolver = null;
            this.googleCredentialRejecter = null;
          },
          ux_mode: 'popup',
        });
        window.__movieguessGoogleInitializedForClientId = environment.googleClientId;
      }

      googleIdentity.accounts.id.cancel?.();

      googleIdentity.accounts.id.prompt(notification => {
        if (isResolved) return;

        if (
          notification.isNotDisplayed() ||
          notification.isSkippedMoment() ||
          notification.isDismissedMoment()
        ) {
          isResolved = true;
          clearTimeout(timeoutId);
          this.googleCredentialResolver = null;
          this.googleCredentialRejecter = null;
          reject(new Error('Google sign-in was cancelled or blocked.'));
        }
      });
    });
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
