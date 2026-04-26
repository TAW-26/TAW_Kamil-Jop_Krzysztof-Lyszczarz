import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import confetti from 'canvas-confetti';
import { Button } from '../button/button';

@Component({
  selector: 'app-game-win-dialog',
  imports: [CommonModule, Button],
  templateUrl: './game-win-dialog.html',
  styleUrl: './game-win-dialog.css',
})
export class GameWinDialog implements AfterViewInit {
  @Input({ required: true }) movieTitle!: string;
  @Input({ required: true }) guessCount!: number;
  @Input() isLoggedIn = false;
  @Input() ticketsAwarded: number | null = null;

  @Output() closed = new EventEmitter<void>();

  private readonly destroyRef = inject(DestroyRef);
  private confettiTimeouts: number[] = [];

  protected get attemptsPhrase(): string {
    const n = this.guessCount;
    if (n === 1) {
      return 'in 1 guess';
    }
    return `in ${n} guesses`;
  }

  protected get ticketsPhrase(): string {
    if (this.ticketsAwarded === null) {
      return '';
    }
    const t = this.ticketsAwarded;
    if (t === 1) {
      return 'You earned 1 ticket.';
    }
    return `You earned ${t} tickets.`;
  }

  ngAfterViewInit(): void {
    document.body.style.overflow = 'hidden';
    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
      this.confettiTimeouts.forEach((id) => window.clearTimeout(id));
    });
    this.fireConfetti();
  }

  private fireConfetti(): void {
    const palette = ['#d4af37', '#f5e6a8', '#2e7d32', '#ffffff', '#53c7ff', '#8d6dff'];
    const bursts = [
      () =>
        confetti({
          particleCount: 95,
          spread: 72,
          origin: { y: 0.62 },
          colors: palette,
          ticks: 220,
          gravity: 1.05,
        }),
      () =>
        confetti({
          particleCount: 55,
          angle: 60,
          spread: 52,
          origin: { x: 0, y: 0.62 },
          colors: palette,
        }),
      () =>
        confetti({
          particleCount: 55,
          angle: 120,
          spread: 52,
          origin: { x: 1, y: 0.62 },
          colors: palette,
        }),
    ];
    bursts.forEach((fn, i) => {
      const id = window.setTimeout(fn, i * 200);
      this.confettiTimeouts.push(id);
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  protected onClose(): void {
    this.closed.emit();
  }
}
