import requests
import json
import time
import sys

# Ustawienie kodowania UTF-8 dla standardowego wyjścia
# Bez tego wywalało błąd przy niektórych filmach
sys.stdout.reconfigure(encoding='utf-8')

# Klucze API
TMDB_API_KEY = "PLACEHOLDER"
OMDB_API_KEY = "PLACEHOLDER" 

# URL-e API
TMDB_DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie"
TMDB_DETAILS_URL = "https://api.themoviedb.org/3/movie/"
OMDB_URL = "http://www.omdbapi.com/"
# Liczba stron do przetworzenia (20 filmów na stronę, więc 500 stron to 10k filmów)
TOTAL_PAGES = 50
final_movies_data = []





for page in range(1, TOTAL_PAGES + 1):
    # Dodajemy paramsy do zapytania, aby pobrać filmy posortowane wraz ze stroną i kluczem API    
    params_discover = {
        "api_key": TMDB_API_KEY,
        "page": page,
        "with_original_language": "pl", 
        "sort_by": "vote_count.desc"    
    }
    
    # Pobieramy listę filmów z TMDB dla danej strony
    try:
        response_discover = requests.get(TMDB_DISCOVER_URL, params=params_discover).json()
        movies_list = response_discover.get("results", [])
    except Exception as e:
        print(f"Błąd podczas pobierania strony {page}: {e}.")
        continue    
    # Iterujemy po filmach z tej strony, pobierając szczegóły i łącząc dane z TMDB i OMDB
    for index, movie in enumerate(movies_list):
        tmdb_id = movie["id"]
        print(f"[Strona {page}] Przetwarzam film z TMDB ID: {tmdb_id}...")
        try: 
            tmdb_details = requests.get(f"{TMDB_DETAILS_URL}{tmdb_id}", params={"api_key": TMDB_API_KEY}).json()
            imdb_id = tmdb_details.get("imdb_id")
            
            if not imdb_id:
                continue
            # Paramsy do omdb
            omdb_params = {
                "apikey": OMDB_API_KEY,
                "i": imdb_id
            }
            omdb_details = requests.get(OMDB_URL, params=omdb_params).json()
            
            rt_score = None
            # Konwersja z rotten tomatoes bo tam jest w formacie "85%" a my chcemy int
            if "Ratings" in omdb_details:
                for rating in omdb_details["Ratings"]:
                    if rating["Source"] == "Rotten Tomatoes":
                        rt_score = int(rating["Value"].replace("%", "")) 
                        break
                        
            # Sprawdzamy, czy film zdobył Oscara
            awards_text = omdb_details.get("Awards", "")
            is_oscar_winner = "Oscar" in awards_text
            
            clean_movie = {
                "tmdb_id": tmdb_details["id"],
                "imdb_id": imdb_id,
                "title": tmdb_details.get("title"), 
                "original_title": tmdb_details.get("original_title"),
                "original_language": tmdb_details.get("original_language"),
                "release_date": tmdb_details.get("release_date"),
                "budget": tmdb_details.get("budget", 0),
                "revenue": tmdb_details.get("revenue", 0),
                "poster_path": tmdb_details.get("poster_path"),
                "backdrop_path": tmdb_details.get("backdrop_path"),
                "overview": tmdb_details.get("overview"),

                # Konwersja listy słowników na listę samych nazw gatunków i nazw firm produkcyjnych
                # TMDB zwraca gatunki i firmy jako listę słowników, więc wyciągamy tylko potrzebne informacje
                # Dla gatunków bierzemy tylko ID, a dla firm produkcyjnych bierzemy nazwę
                # I gatunki potem bedziemy z enuma brać
                "genres": [g["id"] for g in tmdb_details.get("genres", [])],
                "production_companies": [c["name"] for c in tmdb_details.get("production_companies", [])],
                
                "director": omdb_details.get("Director", "N/A"),
                # Konwersja listy aktorów z formatu "Actor1, Actor2, Actor3" na listę ["Actor1", "Actor2", "Actor3"]
                "actors": [a.strip() for a in omdb_details.get("Actors", "").split(",") if a.strip()][:3],
                "imdb_rating": omdb_details.get("imdbRating", "N/A"),
                "rotten_tomatoes_score": rt_score,
                "is_oscar_winner": is_oscar_winner
            }

            final_movies_data.append(clean_movie)
            
            time.sleep(0.05)
            
        except Exception as e:
            print(f"Błąd przy filmie {tmdb_id}: {e}.")
            continue


with open("baza_1k_polskie.json", "w", encoding="utf-8") as f:
    json.dump(final_movies_data, f, ensure_ascii=False, indent=4)
print("Dane zostały zapisane do 'baza_1k_polskie.json'. Skrypt zakończył działanie.")