import { TicketTheme } from '../shared/components/ticket/ticket';

export function ticketThemeFromSlug(slug: string): TicketTheme {
  const s = slug.trim().toLowerCase();
  if (s === 'polish' || s.includes('polish')) {
    return 'polish';
  }
  if (s === 'oscar-winners' || s.includes('oscar')) {
    return 'oscar';
  }
  if (s === 'top-rotten-tomatoes' || s.includes('rotten')) {
    return 'rotten';
  }
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
