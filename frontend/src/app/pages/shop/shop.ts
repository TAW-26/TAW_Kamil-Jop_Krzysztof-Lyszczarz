import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { TMDB_MOVIE_GENRES, TmdbGenreOption } from '../../constants/tmdb-movie-genres';
import { ShopItem, ShopItemsMeta, ShopItemsParams } from '../../interfaces/avatar-shop.interface';
import { AuthService } from '../../services/auth.service';
import { AvatarShopApiService } from '../../services/avatar-shop-api.service';
import { ToastService } from '../../services/toast.service';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ShopCard, ShopCardVariant } from '../../shared/components/shop-card/shop-card';
import { TabButtons } from '../../shared/components/tab-buttons/tab-buttons';

const CATALOG_LIMIT = 12;

interface PurchaseConfirmContext {
  movieId: number;
  movieTitle: string;
  price: number;
}
const SEARCH_DEBOUNCE_MS = 380;

@Component({
  selector: 'app-shop',
  imports: [CommonModule, Navbar, Footer, ShopCard, TabButtons, ConfirmDialog],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit, OnDestroy {
  private readonly avatarShop = inject(AvatarShopApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly genreOptions: readonly TmdbGenreOption[] = TMDB_MOVIE_GENRES;

  protected readonly catalogTabIndex = signal(0);
  protected readonly avatarTabs = ['ALL', 'FOR SALE', 'OWNED'];

  protected readonly searchInputDraft = signal('');
  protected readonly searchQuery = signal('');
  protected readonly sortYear = signal<'asc' | 'desc' | undefined>(undefined);
  protected readonly genreId = signal<number | undefined>(undefined);

  protected readonly shopItems = signal<ShopItem[]>([]);
  protected readonly meta = signal<ShopItemsMeta | null>(null);
  protected readonly loading = signal(false);
  protected readonly purchasingId = signal<number | null>(null);
  protected readonly equippingId = signal<number | null>(null);
  protected readonly purchaseConfirm = signal<PurchaseConfirmContext | null>(null);

  protected readonly pointsBalance = computed(
    () => this.auth.currentUser()?.points_balance ?? 0,
  );

  protected readonly equippedAvatarId = computed(
    () => this.auth.currentUser()?.equipped_avatar_id ?? null,
  );

  protected readonly sortYearSelectValue = computed(() => this.sortYear() ?? '');
  protected readonly genreSelectValue = computed(() =>
    this.genreId() != null ? String(this.genreId()) : '',
  );

  private searchDebounceId: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
    this.loadPage(1);
  }

  ngOnDestroy(): void {
    if (this.searchDebounceId !== undefined) {
      clearTimeout(this.searchDebounceId);
    }
  }

  protected onCatalogTabChange(index: number): void {
    this.catalogTabIndex.set(index);
    this.loadPage(1);
  }

  protected onSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.searchInputDraft.set(v);
    if (this.searchDebounceId !== undefined) {
      clearTimeout(this.searchDebounceId);
    }
    this.searchDebounceId = setTimeout(() => {
      this.searchDebounceId = undefined;
      const next = v.trim();
      this.searchQuery.set(next);
      this.loadPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }

  protected onSortYearChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.sortYear.set(v === '' ? undefined : (v as 'asc' | 'desc'));
    this.loadPage(1);
  }

  protected onGenreChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.genreId.set(v === '' ? undefined : Number(v));
    this.loadPage(1);
  }

  protected loadPage(page: number): void {
    this.loading.set(true);
    const params = this.buildShopParams(page);
    this.avatarShop.fetchShopItems(params).subscribe({
      next: (res) => {
        this.shopItems.set(res.items);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error(err);
        this.toast.show(err.message ?? 'Could not load the shop');
        this.loading.set(false);
      },
    });
  }

  protected openPurchaseConfirm(movieId: number): void {
    if (this.purchasingId() !== null || this.loading() || this.purchaseConfirm() !== null) {
      return;
    }
    const item = this.shopItems().find((i) => i.id === movieId);
    if (!item || item.isOwned || this.pointsBalance() < item.price) {
      return;
    }
    this.purchaseConfirm.set({
      movieId,
      movieTitle: item.title || 'Movie',
      price: item.price,
    });
  }

  protected dismissPurchaseConfirm(): void {
    this.purchaseConfirm.set(null);
  }

  protected confirmPurchase(): void {
    const ctx = this.purchaseConfirm();
    if (!ctx) {
      return;
    }
    this.purchaseConfirm.set(null);
    this.executePurchase(ctx.movieId);
  }

  protected purchaseConfirmBody(ctx: PurchaseConfirmContext): string {
    const after = Math.max(0, this.pointsBalance() - ctx.price);
    return `Are you sure you want to buy the avatar “${ctx.movieTitle}” for ${ctx.price} tickets? After purchase you will have ${after} tickets left.`;
  }

  private executePurchase(movieId: number): void {
    if (this.purchasingId() !== null) {
      return;
    }
    this.purchasingId.set(movieId);
    this.avatarShop
      .purchaseAvatar(movieId)
      .pipe(finalize(() => this.purchasingId.set(null)))
      .subscribe({
        next: (res) => {
          this.toast.show(res.message);
          this.auth.fetchCurrentUser().subscribe({ error: console.error });
          this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
          this.loadPage(this.meta()?.currentPage ?? 1);
        },
        error: (err: Error) => this.toast.show(err.message),
      });
  }

  protected cardVariant(item: ShopItem): ShopCardVariant {
    if (item.isOwned) {
      return this.equippedAvatarId() === item.id ? 'card-eq-equipped' : 'card-eq-to-equip';
    }
    if (this.pointsBalance() >= item.price) {
      return 'buy-new';
    }
    return 'default-buy';
  }

  protected onEquipAvatar(movieId: number): void {
    if (this.equippingId() !== null || this.loading()) {
      return;
    }
    this.equippingId.set(movieId);
    this.avatarShop
      .equipAvatar(movieId)
      .pipe(finalize(() => this.equippingId.set(null)))
      .subscribe({
        next: (res) => {
          this.toast.show(res.message);
          this.auth.fetchCurrentUser().subscribe({ error: console.error });
          this.avatarShop.fetchOwnedAvatars().subscribe({ error: console.error });
          this.loadPage(this.meta()?.currentPage ?? 1);
        },
        error: (err: Error) => this.toast.show(err.message),
      });
  }

  protected releaseYearText(iso: string | null): string {
    if (!iso) {
      return '';
    }
    const y = new Date(iso).getFullYear();
    if (Number.isNaN(y)) {
      return '';
    }
    return `Release: ${y}`;
  }

  protected trackByMovieId(_index: number, item: ShopItem): number {
    return item.id;
  }

  protected trackByGenreId(_index: number, g: TmdbGenreOption): number {
    return g.id;
  }

  protected goPrevPage(): void {
    const m = this.meta();
    if (!m || m.currentPage <= 1) {
      return;
    }
    this.loadPage(m.currentPage - 1);
  }

  protected goNextPage(): void {
    const m = this.meta();
    if (!m || m.currentPage >= m.totalPages) {
      return;
    }
    this.loadPage(m.currentPage + 1);
  }

  private buildShopParams(page: number): ShopItemsParams {
    const ownership = this.ownershipForTab(this.catalogTabIndex());
    const search = this.searchQuery().trim();
    const sortY = this.sortYear();
    const genre = this.genreId();
    const params: ShopItemsParams = {
      page,
      limit: CATALOG_LIMIT,
      ownership,
    };
    if (search) {
      params.search = search;
    }
    if (sortY) {
      params.sortYear = sortY;
    }
    if (genre != null) {
      params.genre = genre;
    }
    return params;
  }

  private ownershipForTab(tabIndex: number): 'all' | 'owned' | 'unowned' | undefined {
    if (tabIndex === 1) {
      return 'unowned';
    }
    if (tabIndex === 2) {
      return 'owned';
    }
    return undefined;
  }
}
