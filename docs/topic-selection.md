# Wybór tematu projektu

## 1. Opis wybranego tematu projektu

Przedmiotem projektu jest pełnostosowa aplikacja webowa inspirowana mechaniką gry **Wordle**, jednak dostosowana do tematyki filmów i seriali. Głównym założeniem systemu jest codzienne lub losowe odgadywanie pełnych tytułów filmów i seriali w języku polskim na podstawie prezentowanej sceny oraz dodatkowych podpowiedzi związanych z danym tytułem. Podpowiedzi mogą dotyczyć między innymi reżysera, aktorów, gatunku lub innych cech produkcji. 

Aplikacja będzie miała charakter portalu internetowego z możliwością rejestracji i logowania użytkowników. Każdy użytkownik będzie mógł brać udział w rozgrywce, zapisywać swoje wyniki oraz porównywać osiągnięcia z innymi graczami w rankingach. Szczególny nacisk zostanie położony na aspekt rywalizacji, ponieważ ranking graczy będzie jednym z głównych elementów projektu. Ranking może uwzględniać na przykład liczbę poprawnie odgadniętych tytułów, liczbę prób potrzebnych do odgadnięcia „tytułu dnia” oraz skuteczność gracza w dłuższym okresie.

Projekt łączy elementy rozrywki, rywalizacji oraz zarządzania treścią multimedialną. Dzięki połączeniu mechaniki znanej z Wordle z tematyką filmowo-serialową możliwe będzie stworzenie nowoczesnej i angażującej aplikacji webowej, atrakcyjnej dla użytkowników zainteresowanych kinem i serialami.

## 2. Cel projektu

Celem projektu jest zaprojektowanie i implementacja nowoczesnej aplikacji internetowej umożliwiającej użytkownikom odgadywanie tytułów filmów i seriali na podstawie scen oraz inteligentnych podpowiedzi. System ma zapewniać zarówno warstwę rozrywkową, jak i społecznościową, poprzez wprowadzenie kont użytkowników, historii rozgrywek oraz rankingów graczy.

Do celów szczegółowych projektu należą:

- opracowanie mechanizmu rozgrywki inspirowanego Wordle, dostosowanego do pełnych tytułów filmów i seriali,
- umożliwienie użytkownikom rejestracji, logowania i zarządzania własnym kontem,
- przechowywanie wyników rozgrywek oraz analiza skuteczności użytkowników,
- stworzenie systemu rankingowego pozwalającego porównywać osiągnięcia graczy,
- przygotowanie intuicyjnego i responsywnego interfejsu użytkownika,
- zaprojektowanie backendu obsługującego logikę gry, użytkowników oraz dane rankingowe,
- zapewnienie możliwości dalszej rozbudowy systemu, np. o dodatkowe informacje o filmie lub serialu po poprawnym odgadnięciu tytułu.

Projekt ma również na celu praktyczne wykorzystanie technologii full stack, w szczególności frameworka Angular po stronie klienta oraz środowiska Node.js po stronie serwera.

## 3. Zakres funkcjonalny

Zakres funkcjonalny projektowanej aplikacji obejmuje następujące elementy:

### Funkcjonalności dla użytkownika niezalogowanego

- wyświetlenie strony głównej aplikacji,
- możliwość rejestracji nowego konta,
- możliwość logowania do systemu,
- obsługa trybu „tytuł dnia”,
- dostęp do podstawowych informacji o zasadach gry.

### Funkcjonalności dla użytkownika zalogowanego

- udział w rozgrywce polegającej na odgadywaniu pełnego tytułu filmu lub serialu,
- prezentacja sceny jako głównej wskazówki do odgadnięcia tytułu,
- wprowadzanie odpowiedzi przez użytkownika,
- udzielanie podpowiedzi na podstawie zgodności wybranych cech, np. reżysera, aktora, gatunku lub innych atrybutów,
- możliwość uruchamiania dodatkowych trybów gry,
- zapis wyników użytkownika, w tym liczby prób potrzebnych do odgadnięcia tytułu,
- podgląd historii rozegranych gier,
- podgląd pozycji w rankingu graczy,
- przeglądanie ogólnego rankingu użytkowników,
- edycja podstawowych danych konta.

### Funkcjonalności opcjonalne

- wyświetlanie dodatkowych informacji o filmie lub serialu po poprawnym odgadnięciu tytułu, np. opisu, roku produkcji, gatunku lub obsady,
- system osiągnięć lub statystyk użytkownika,
- panel administracyjny do zarządzania bazą tytułów, scen i podpowiedzi,
- filtrowanie rozgrywek według kategorii, np. film lub serial,
- rozbudowany system punktacji zależny od liczby prób i czasu odpowiedzi.

### Funkcjonalności administracyjne

- zarządzanie bazą tytułów filmów i seriali,
- dodawanie, edycja i usuwanie scen używanych w grze,
- definiowanie zestawów podpowiedzi dla poszczególnych tytułów,
- moderowanie treści oraz kontrola poprawności danych,
- zarządzanie użytkownikami i wynikami.

## 4. Proponowane technologie

Ze względu na charakter projektu oraz założenie realizacji w modelu full stack, proponuje się następujący zestaw technologii:

### Warstwa frontendowa

- **Angular** – framework do budowy nowoczesnego interfejsu użytkownika w architekturze SPA,
- **TypeScript** – język programowania zwiększający bezpieczeństwo typowania i czytelność kodu,
- **TailwindCSS** lub **Bootstrap** – biblioteki do tworzenia estetycznego i responsywnego interfejsu,
- **RxJS** – obsługa programowania reaktywnego i komunikacji asynchronicznej.

### Warstwa backendowa

- **Node.js** – środowisko uruchomieniowe dla logiki serwera,
- **Express.js** – framework upraszczający budowę REST API,
- **JWT (JSON Web Token)** – mechanizm autoryzacji i utrzymywania sesji użytkownika,
- **bcrypt** – zabezpieczenie haseł użytkowników poprzez haszowanie.

### Baza danych

- **MongoDB** – nierelacyjna baza danych odpowiednia do przechowywania danych użytkowników, wyników, tytułów oraz podpowiedzi,
- alternatywnie **PostgreSQL**, jeśli projekt będzie wymagał bardziej relacyjnego modelu danych.

### Dodatkowe narzędzia i technologie

- **Mongoose** – mapowanie danych i wygodna obsługa kolekcji w MongoDB,
- **REST API** – komunikacja pomiędzy frontendem i backendem,
- **Git + GitHub** – kontrola wersji i zarządzanie repozytorium projektu,
- **Postman** – testowanie endpointów API,
- **Docker** (opcjonalnie) – konteneryzacja aplikacji,
- **Cloudinary** lub lokalny storage – przechowywanie obrazów/scen wykorzystywanych w grze.

## 5. Podsumowanie

Proponowany projekt stanowi interesujące połączenie gry logicznej, portalu internetowego oraz aplikacji społecznościowej. Jego realizacja pozwoli na praktyczne zastosowanie technologii Angular i Node.js w pełnostosowym środowisku programistycznym. Projekt jest wystarczająco rozbudowany, aby zaprezentować umiejętności związane z projektowaniem interfejsu, implementacją logiki biznesowej, autoryzacją użytkowników, obsługą baz danych oraz tworzeniem systemu rankingowego. Jednocześnie pozostawia możliwość dalszego rozwijania o kolejne moduły i funkcjonalności.
