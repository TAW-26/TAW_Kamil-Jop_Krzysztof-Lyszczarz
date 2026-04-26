import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-input',
  imports: [CommonModule],
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
})
export class SearchInput {
  @Input() suggestions: string[] = [
    'The Godfather',
    'Inception',
    'Pulp Fiction',
    'The Dark Knight',
    'Fight Club',
    'Interstellar',
    'Forrest Gump',
  ];

  protected query = '';
  protected showSuggestions = false;

  protected get filteredSuggestions(): string[] {
    const q = this.query.trim().toLowerCase();
    if (!q) {
      return [];
    }

    return this.suggestions
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, 6);
  }

  protected onInput(value: string): void {
    this.query = value;
    this.showSuggestions = this.filteredSuggestions.length > 0;
  }

  protected selectSuggestion(value: string): void {
    this.query = value;
    this.showSuggestions = false;
  }

  protected closeSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 120);
  }
}
