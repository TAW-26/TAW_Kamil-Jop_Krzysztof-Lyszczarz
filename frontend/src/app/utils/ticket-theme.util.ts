import { TicketTheme } from '../shared/components/ticket/ticket';

export function ticketThemeFromSlug(slug: string): TicketTheme {
  const s = slug.trim().toLowerCase();
  if (s.includes('horror')) {
    return 'horror';
  }
  if (s.includes('cartoon')) {
    return 'cartoons';
  }
  if (s === 'daily' || s.includes('daily') || s === 'top-500-revenue') {
    return 'daily-challenge';
  }
  return 'default';
}
