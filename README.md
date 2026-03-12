# MovieGuess

MovieGuess to aplikacja full stack (Angular + Node.js) inspirowana Wordle, w której użytkownik zgaduje tytuły filmów i seriali na podstawie scen oraz podpowiedzi.

## Wymagania

- Node.js 22.12+ (zalecane aktualne LTS)
- npm 10+
- Git

## Struktura projektu

```text
.
├── backend/
│   ├── package.json
│   └── src/
│       └── main.js
├── frontend/
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

API testowe będzie dostępne pod adresem:

```text
http://localhost:3000/api/test
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