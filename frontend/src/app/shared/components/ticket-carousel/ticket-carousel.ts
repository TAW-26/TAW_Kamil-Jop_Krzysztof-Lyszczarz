import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import { Router } from '@angular/router';
import { HOME_TICKET_CAROUSEL_ITEMS, TicketCarouselItem } from '../../../constants/game-categories';
import { Ticket, TicketTheme } from '../ticket/ticket';
import { ticketThemeFromSlug } from '../../../utils/ticket-theme.util';

export type { TicketCarouselItem };

@Component({
  selector: 'app-ticket-carousel',
  imports: [CommonModule, Ticket],
  templateUrl: './ticket-carousel.html',
  styleUrl: './ticket-carousel.css',
})
export class TicketCarousel implements AfterViewInit, OnDestroy, OnChanges {
  @Input() items: TicketCarouselItem[] = HOME_TICKET_CAROUSEL_ITEMS;

  @ViewChild('viewport', { static: true })
  private viewportRef?: ElementRef<HTMLElement>;

  protected activeIndex = 0;
  protected canScrollPrev = false;
  protected canScrollNext = false;

  private emblaApi?: EmblaCarouselType;
  private loopEnabled = true;
  private readonly tweenFactorBase = 0.84;
  private tweenFactor = 0;
  private isDestroyed = false;
  private autoplayIntervalId?: number;
  private autoplayDelayMs = 4000;
  private isAutoplayPaused = false;
  private resumeAutoplayTimeoutId?: number;
  private readonly manualPauseMs = 2200;

  constructor(
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {}

  protected get activeCategory(): string {
    return this.items[this.activeIndex]?.label ?? '';
  }

  ngAfterViewInit(): void {
    const viewport = this.viewportRef?.nativeElement;
    if (!viewport) {
      return;
    }

    this.loopEnabled = this.items.length > 1;
    this.emblaApi = EmblaCarousel(viewport, {
      loop: this.loopEnabled,
      align: 'center',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    });
    this.bindEmbla();
    this.startAutoplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['items']) {
      return;
    }

    if (!this.items.length) {
      this.activeIndex = 0;
    }
    this.loopEnabled = this.items.length > 1;
    this.emblaApi?.reInit({ loop: this.loopEnabled, align: 'center', slidesToScroll: 1 });
    this.startAutoplay();
  }

  protected previous(): void {
    if (!this.emblaApi) {
      return;
    }
    this.pauseAutoplayTemporarily();
    this.emblaApi.scrollPrev();
  }

  protected next(): void {
    if (!this.emblaApi) {
      return;
    }
    this.pauseAutoplayTemporarily();
    this.emblaApi.scrollNext();
  }

  protected selectCategory(index: number): void {
    const slug = (this.items[index]?.slug ?? '').trim();
    if (!slug) {
      return;
    }

    void this.router.navigate(['/game', slug], { queryParams: { autoscroll: '1' } });
  }

  protected getThemeForSlug(slug: string): TicketTheme {
    return ticketThemeFromSlug(slug);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.stopAutoplay();
    if (this.resumeAutoplayTimeoutId) {
      window.clearTimeout(this.resumeAutoplayTimeoutId);
      this.resumeAutoplayTimeoutId = undefined;
    }
    this.emblaApi?.destroy();
    this.emblaApi = undefined;
  }

  protected pauseAutoplay(): void {
    this.isAutoplayPaused = true;
  }

  protected resumeAutoplay(): void {
    this.isAutoplayPaused = false;
  }

  private bindEmbla(): void {
    if (!this.emblaApi) {
      return;
    }

    this.setTweenFactor();
    this.updateUiState();
    this.tweenOpacity();

    this.emblaApi
      .on('reInit', () => {
        this.setTweenFactor();
        this.updateUiState();
        this.tweenOpacity();
      })
      .on('select', () => {
        this.updateUiState();
        this.tweenOpacity();
      })
      .on('scroll', () => this.tweenOpacity())
      .on('slideFocus', () => this.tweenOpacity());
  }

  private updateUiState(): void {
    if (!this.emblaApi) {
      return;
    }

    this.ngZone.run(() => {
      this.activeIndex = this.emblaApi!.selectedScrollSnap();
      this.canScrollPrev = this.emblaApi!.canScrollPrev();
      this.canScrollNext = this.emblaApi!.canScrollNext();
      this.cdr.markForCheck();
    });
  }

  private setTweenFactor(): void {
    if (!this.emblaApi) {
      return;
    }
    this.tweenFactor = this.tweenFactorBase * this.emblaApi.scrollSnapList().length;
  }

  private tweenOpacity(): void {
    if (!this.emblaApi || this.isDestroyed) {
      return;
    }

    const scrollProgress = this.emblaApi.scrollProgress();
    const slideNodes = this.emblaApi.slideNodes();

    this.emblaApi.scrollSnapList().forEach((scrollSnap: number, snapIndex: number) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slideIndex = snapIndex;

      if (slideIndex >= slideNodes.length) {
        return;
      }

      if (this.loopEnabled) {
        // Adjust for loop wrapping using scroll progress bounds.
        if (diffToTarget > 0.5) {
          diffToTarget -= 1;
        } else if (diffToTarget < -0.5) {
          diffToTarget += 1;
        }
      }

      const tweenValue = 1 - Math.abs(diffToTarget * this.tweenFactor);
      const opacity = Math.min(Math.max(tweenValue, 0.34), 1).toString();
      slideNodes[slideIndex].style.opacity = opacity;

      const absDiff = Math.abs(diffToTarget);
      const scale = Math.max(0.58, 1 - absDiff * 0.36);
      const rotateY = Math.max(-120, Math.min(120, diffToTarget * 120));
      const ticketScaleNode = slideNodes[slideIndex].querySelector<HTMLElement>(
        '.ticket-carousel__ticket-scale'
      );
      if (ticketScaleNode) {
        ticketScaleNode.style.transform = `scale(${scale}) rotateY(${rotateY}deg)`;
        ticketScaleNode.style.opacity = opacity;
      }
    });
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (!this.emblaApi || this.items.length <= 1) {
      return;
    }
    this.autoplayIntervalId = window.setInterval(() => {
      if (this.isDestroyed || this.isAutoplayPaused || !this.emblaApi) {
        return;
      }
      this.emblaApi.scrollNext();
    }, this.autoplayDelayMs);
  }

  private stopAutoplay(): void {
    if (!this.autoplayIntervalId) {
      return;
    }
    window.clearInterval(this.autoplayIntervalId);
    this.autoplayIntervalId = undefined;
  }

  private pauseAutoplayTemporarily(): void {
    this.isAutoplayPaused = true;
    if (this.resumeAutoplayTimeoutId) {
      window.clearTimeout(this.resumeAutoplayTimeoutId);
    }
    this.resumeAutoplayTimeoutId = window.setTimeout(() => {
      this.isAutoplayPaused = false;
      this.resumeAutoplayTimeoutId = undefined;
    }, this.manualPauseMs);
  }
}
