# Dokumentacja API 

Wszystkie endpointy naszego API zostały udokumentowane i przetestowane za pomocą narzędzia Postman. 
Gotowa kolekcja zawiera opisy, przykładowe dane wejściowe oraz strukturę folderów z podziałem na kontrolery.

## Jak zaimportować kolekcję do Postmana?

1. Otwórz aplikację Postman.
2. Kliknij przycisk **Import** (lewy górny róg).
3. Wybierz i zaimportuj dwa pliki znajdujące się w folderze `docs/`:
   - `Tests.postman_collection.json` (Główna kolekcja zapytań)
   - `Prod.postman_environment.json` (Zmienne środowiskowe)
4. W prawym górnym rogu Postmana upewnij się, że z listy rozwijanej wybrałeś zaimportowane środowisko.

---

## Struktura Endpointów

Nasze API dzieli się na następujące główne moduły:

### 1. AuthController (`/api/auth`)
- `POST /register` - Rejestracja nowego użytkownika.
- `POST /login` - Logowanie.
- `GET /me` - Pobieranie danych aktualnie zalogowanego użytkownika.
- `POST /google` - Autoryzacja przez Google OAuth.

### 2. GameController (`/api/game`)
- `POST /guess` - Wysyłanie próby odgadnięcia filmu..
- `GET /hint` - Pobieranie podpowiedzi w zależności od liczby prób.
- `GET /current` - Zwraca aktualny stan gry w danym dniu.

### 3. LeaderboardController (`/api/leaderboard`)
- `GET /points` - Globalny ranking punktowy graczy.
- `GET /streaks` - Ranking najdłuższych serii graczy.
- `GET /daily-attempts` - Histogram prób z dzisiejszego wyzwania.

### 4. AvatarShopController (`/api/shop`)
- `GET /items` - Pobiera dostępne awatary.
- `POST /purchase` - Zakup awatara za zdobyte w grze punkty.