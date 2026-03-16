# Pozyskanie danych o filmach

Folder zawiera skrypty służące do budowy bazy danych projektu.

## Opis skryptów
* **Pobieranie danych (TMDB + OMDB)**: Skrypty łączą dane z dwóch API (opisy, budżety, oceny Rotten Tomatoes, reżyserzy, obsada).
    * ``baza_1k_polskie.json``: Filmy polskojęzyczne.
    * ``baza_10k_filmow.json``: Filmy światowe (według przychodów).
* **Migracja (PostgreSQL)**: Skrypt wgrywający parsuje JSON-y i wykonuje masowy zapis (batch insert) do tabeli \`movies\` z obsługą duplikatów.

## Szybki start
1. ``pip install requests psycopg2``
2. Uzupełnij klucze API i \`DB_URL\` w skryptach.
3. Uruchom pobieranie, a następnie import do bazy.

## Zakres danych
ID (TMDB/IMDB), tytuły, daty, finanse, oceny, gatunki, reżyseria, obsada oraz info o Oscarach.
"@

