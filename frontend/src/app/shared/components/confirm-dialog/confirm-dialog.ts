import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  @Input({ required: true }) heading!: string;
  @Input({ required: true }) body!: string;
  @Input({ required: true }) confirmTickets!: string;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.cancel.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}
