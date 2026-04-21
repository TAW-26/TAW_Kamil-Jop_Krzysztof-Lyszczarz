import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import { Router } from '@angular/router';
import { Ticket } from '../ticket/ticket';

@Component({
  selector: 'app-ticket-carousel',
  imports: [CommonModule, Ticket],
  templateUrl: './ticket-carousel.html',
  styleUrl: './ticket-carousel.css',
})
export class TicketCarousel implements AfterViewInit, OnDestroy, OnChanges {
  @Input() categories: string[] = ['Horror', 'Akcja', 'Sci-Fi', 'Komedia'];

  @ViewChild('viewport', { static: true })
  private viewportRef?: ElementRef<HTMLElement>;

  protected activeIndex = 0;
  protected canScrollPrev = false;
  protected canScrollNext = false;

  private emblaApi?: EmblaCarouselType;
  private readonly loopEnabled = true;
  private readonly tweenFactorBase = 0.84;
  private tweenFactor = 0;
  private isDestroyed = false;

  constructor(private readonly router: Router) {}

  protected get activeCategory(): string {
    return this.categories[this.activeIndex] ?? '';
  }

  ngAfterViewInit(): void {
    const viewport = this.viewportRef?.nativeElement;
    if (!viewport) {
      return;
    }

    this.emblaApi = EmblaCarousel(viewport, { loop: this.loopEnabled, align: 'center' });
    this.bindEmbla();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['categories']) {
      return;
    }

    if (!this.categories.length) {
      this.activeIndex = 0;
    }
    this.emblaApi?.reInit();
  }

  protected previous(): void {
    if (!this.emblaApi) {
      return;
    }
    this.emblaApi.scrollPrev();
  }

  protected next(): void {
    if (!this.emblaApi) {
      return;
    }
    this.emblaApi.scrollNext();
  }

  protected selectCategory(index: number): void {
    const category = (this.categories[index] ?? '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!category) {
      return;
    }

    void this.router.navigate(['/game', category]);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.emblaApi?.destroy();
    this.emblaApi = undefined;
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
      .on('select', () => this.updateUiState())
      .on('scroll', () => this.tweenOpacity())
      .on('slideFocus', () => this.tweenOpacity());
  }

  private updateUiState(): void {
    if (!this.emblaApi) {
      return;
    }

    this.activeIndex = this.emblaApi.selectedScrollSnap();
    this.canScrollPrev = this.emblaApi.canScrollPrev();
    this.canScrollNext = this.emblaApi.canScrollNext();
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
    const slidesInView = this.emblaApi.slidesInView();
    const slideNodes = this.emblaApi.slideNodes();

    this.emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slideIndex = snapIndex;

      if (slideIndex >= slideNodes.length) {
        return;
      }

      if (!slidesInView.includes(slideIndex)) {
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
      const opacity = Math.min(Math.max(tweenValue, 0), 1).toString();
      slideNodes[slideIndex].style.opacity = opacity;
    });
  }
}
