# MovieGuess

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=111111)](https://render.com/)

MovieGuess to aplikacja full stack (Angular + Node.js) inspirowana formatem Loldle (daily guessing game), w której użytkownik zgaduje tytuły filmów i seriali na podstawie scen oraz podpowiedzi.

## Wersja online

Aplikacja jest hostowana pod adresem: [https://mvguess.vercel.app](https://mvguess.vercel.app)

## Stack technologiczny

- Frontend: Angular 21, TypeScript, RxJS, Embla Carousel.
- Backend: Node.js, Express 5, TypeScript, Prisma ORM.
- Baza danych: PostgreSQL (Supabase).
- Cache: Redis (ioredis).
- Uwierzytelnianie: JWT + Google OAuth 2.0 (Google Sign-In).
- Zadania cykliczne: node-cron (codzienny daily challenge).
- Deployment:
  - Frontend: Vercel
  - Backend: Render
  - Database: Supabase
  - Cache: Redis

## Zakres projektu (technicznie)

- Frontend: Angular 21 (SPA), hostowany na Vercel.
- Backend: Node.js + Express + TypeScript, hostowany na Render.
- Baza danych: PostgreSQL (Supabase) przez Prisma ORM.
- Cache: Redis (ioredis), wykorzystywany m.in. do cache daily challenge, autocomplete i leaderboardu.
- Uwierzytelnianie:
  - JWT dla sesji użytkownika.
  - OAuth 2.0 Google Sign-In jako alternatywna metoda logowania.
- Harmonogram: codzienny cron po stronie backendu (losowanie/odświeżenie dziennego challenge).
- Logika gry: wiele kategorii (m.in. daily, horror, cartoons, polish, oscar-winners, top-rotten-tomatoes) obsługiwanych przez backend i frontend.
- Deployment:
  - frontend: Vercel,
  - backend: Render,
  - baza danych: Supabase Postgres,
  - cache: Redis.

## Wymagania

- Node.js 22.12+ (zalecane aktualne LTS)
- npm 10+
- Git

## Struktura projektu

```text
.
├── backend/
│   ├── lib/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   └── index.ts
│   ├── prisma/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Instalacja zależności

W katalogu głównym uruchom:

```bash
npm install
```

## Uruchomienie lokalne

### 1. Uruchomienie całej aplikacji

```bash
npm run dev
```

### 2. Backend

```bash
npm run backend
```

API backendu będzie dostępne pod adresem:

```text
http://localhost:3000
```

### 3. Frontend

Uruchom frontend:

```bash
npm run frontend
```

Aplikacja będzie dostępna pod adresem:

```text
http://localhost:4200
```

## Twórcy

- Krzysztof Łyszczarz
- Kamil Jop

## Licencja

Projekt jest udostępniany na licencji MIT. Szczegóły znajdują się w pliku `LICENSE`.