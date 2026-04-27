import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { finalize, of, switchMap } from 'rxjs';
import { AuthInput } from '../../shared/components/auth-input/auth-input';
import { Button } from '../../shared/components/button/button';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { ProfileHeaderCard } from '../../shared/components/profile-header-card/profile-header-card';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile-settings',
  imports: [CommonModule, Navbar, Footer, ProfileHeaderCard, AuthInput, Button],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings {
  private readonly auth = inject(AuthService)
  private readonly toast = inject(ToastService)

  protected username = ''
  protected currentPassword = ''
  protected newPassword = ''

  protected readonly isSubmitting = signal(false)
  protected readonly error = signal('')

  private initialUsername = ''

  constructor() {
    const user = this.auth.currentUser()
    this.initialUsername = user?.username ?? ''

    this.username = this.initialUsername
  }

  protected discardChanges(): void {
    if (this.isSubmitting()) return

    this.username = this.initialUsername
    this.currentPassword = ''
    this.newPassword = ''
    this.error.set('')
  }

  protected saveChanges(): void {
    if (this.isSubmitting()) return

    this.error.set('')

    const trimmedUsername = this.username.trim()

    if (!trimmedUsername) {
      this.error.set('Username is required.')
      return
    }

    const user = this.auth.currentUser()
    if (!user) {
      this.error.set('You must be logged in to update account settings.')
      return
    }

    const shouldUpdateProfile = trimmedUsername !== user.username
    const shouldChangePassword = !!this.currentPassword || !!this.newPassword

    if (!shouldUpdateProfile && !shouldChangePassword) {
      this.toast.show('No changes to save.')
      return
    }

    if (shouldChangePassword && (!this.currentPassword || !this.newPassword)) {
      this.error.set('Provide both current and new password.')
      return
    }

    this.isSubmitting.set(true)

    const profileRequest$ = shouldUpdateProfile
      ? this.auth.updateMe({ username: trimmedUsername })
      : null

    const passwordRequest$ = shouldChangePassword
      ? this.auth.changePassword({
          currentPassword: this.currentPassword,
          newPassword: this.newPassword
        })
      : null

    const handleSuccess = (): void => {
      this.initialUsername = this.username.trim()
      this.currentPassword = ''
      this.newPassword = ''
      this.toast.show('Account settings updated.')
      this.error.set('')
    }

    const handleFailure = (err: Error): void => {
      this.error.set(err.message)
    }

    const request$ = profileRequest$
      ? profileRequest$.pipe(switchMap(() => passwordRequest$ ?? of({ message: 'ok' })))
      : passwordRequest$!

    request$
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: handleSuccess,
        error: handleFailure
      })
  }
}
