export type TicketCarouselItem = { slug: string; label: string };

export const GAME_CATEGORY_ITEMS: TicketCarouselItem[] = [
  { slug: 'top-500-revenue', label: 'Daily' },
  { slug: 'horrors', label: 'Horror' },
  { slug: 'cartoons', label: 'Cartoons' },
];

export const HOME_TICKET_CAROUSEL_ITEMS = GAME_CATEGORY_ITEMS;
