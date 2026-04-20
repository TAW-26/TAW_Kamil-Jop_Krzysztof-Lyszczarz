import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Ticket } from '../ticket/ticket';

@Component({
  selector: 'app-ticket-carousel',
  imports: [CommonModule, Ticket],
  templateUrl: './ticket-carousel.html',
  styleUrl: './ticket-carousel.css',
})
export class TicketCarousel implements OnDestroy {
  @Input() categories: string[] = ['Horror', 'Akcja', 'Sci-Fi', 'Komedia'];

  @ViewChild('currentLayer', { static: false })
  private currentLayerRef?: ElementRef<HTMLElement>;
  @ViewChild('incomingLayer', { static: false })
  private incomingLayerRef?: ElementRef<HTMLElement>;

  protected activeIndex = 0;
  protected incomingIndex: number | null = null;
  protected isAnimating = false;

  private readonly animationMs = 520;
  private readonly slideDistancePx = 240;
  private isDestroyed = false;

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  protected get activeCategory(): string {
    return this.categories[this.activeIndex] ?? '';
  }

  protected previous(): void {
    if (!this.categories.length || this.isAnimating) {
      return;
    }
    const nextIndex =
      (this.activeIndex - 1 + this.categories.length) % this.categories.length;
    void this.startTransition(nextIndex, 'right');
  }

  protected next(): void {
    if (!this.categories.length || this.isAnimating) {
      return;
    }
    const nextIndex = (this.activeIndex + 1) % this.categories.length;
    void this.startTransition(nextIndex, 'left');
  }

  protected selectCurrentCategory(): void {
    if (this.isAnimating) {
      return;
    }

    const category = (this.categories[this.activeIndex] ?? '').toLowerCase();
    if (!category) {
      return;
    }

    void this.router.navigate([], {
      queryParams: { category },
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  private async startTransition(
    nextIndex: number,
    direction: 'left' | 'right'
  ): Promise<void> {
    this.incomingIndex = nextIndex;
    this.isAnimating = true;
    this.cdr.detectChanges();

    await this.waitForNextFrame();
    if (this.isDestroyed) {
      return;
    }

    const current = this.currentLayerRef?.nativeElement;
    const incoming = this.incomingLayerRef?.nativeElement;
    if (!current || !incoming) {
      this.isAnimating = false;
      this.incomingIndex = null;
      return;
    }

    const outgoingEndX = direction === 'left' ? -this.slideDistancePx : this.slideDistancePx;
    const incomingStartX = direction === 'left' ? this.slideDistancePx : -this.slideDistancePx;

    const currentAnim = current.animate(
      [
        { transform: 'translateX(0px)', opacity: 1 },
        { transform: `translateX(${outgoingEndX}px)`, opacity: 1 },
      ],
      { duration: this.animationMs, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'forwards' }
    );

    const incomingAnim = incoming.animate(
      [
        { transform: `translateX(${incomingStartX}px)`, opacity: 1 },
        { transform: 'translateX(0px)', opacity: 1 },
      ],
      { duration: this.animationMs, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'forwards' }
    );

    await Promise.allSettled([currentAnim.finished, incomingAnim.finished]);
    if (this.isDestroyed) {
      return;
    }

    currentAnim.cancel();
    incomingAnim.cancel();
    current.style.transform = 'translateX(0px)';
    current.style.opacity = '1';
    incoming.style.transform = 'translateX(0px)';
    incoming.style.opacity = '1';

    this.activeIndex = nextIndex;
    this.incomingIndex = null;
    this.isAnimating = false;
    this.cdr.detectChanges();
  }

  private waitForNextFrame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}
