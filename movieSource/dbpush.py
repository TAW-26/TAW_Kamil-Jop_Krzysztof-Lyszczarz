import json
import psycopg2
from psycopg2.extras import execute_values
import sys


sys.stdout.reconfigure(encoding='utf-8')

DB_URL = "PLACEHOLDER"

#Nazwa pliku z danymi do wgrania
PLIK_DO_WGRANIA = "baza_1k_polskie.json"

print(f"Wczytywanie pliku {PLIK_DO_WGRANIA}...")
try:
    with open(PLIK_DO_WGRANIA, "r", encoding="utf-8") as f:
        movies = json.load(f)
except FileNotFoundError:
    print(f"Nie znaleziono pliku {PLIK_DO_WGRANIA}!")
    sys.exit(1)

print("Łączenie z bazą")
try:
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
except Exception as e:
    print(f"Błąd połączenia z bazą: {e}")
    sys.exit(1)


query = """
    INSERT INTO movies (
        tmdb_id, imdb_id, title, original_title, original_language,
        release_date, budget, revenue, poster_path, backdrop_path,
        overview, genres, production_companies, director, actors,
        imdb_rating, rotten_tomatoes_score, is_oscar_winner
    ) VALUES %s
    ON CONFLICT (tmdb_id) DO NOTHING;
"""

print("Przygotowywanie danych")
values = []
for m in movies:
    rd = m.get("release_date")
    if not rd or rd.strip() == "":
        rd = None

    values.append((
        m.get("tmdb_id"), 
        m.get("imdb_id"), 
        m.get("title"), 
        m.get("original_title"), 
        m.get("original_language"),
        rd, 
        m.get("budget", 0), 
        m.get("revenue", 0), 
        m.get("poster_path"), 
        m.get("backdrop_path"),
        m.get("overview"), 
        m.get("genres", []), 
        m.get("production_companies", []), 
        m.get("director", "N/A"), 
        m.get("actors", []),
        m.get("imdb_rating"), 
        m.get("rotten_tomatoes_score"), 
        m.get("is_oscar_winner", False)
    ))


try:
    execute_values(cursor, query, values, page_size=1000)
    conn.commit()
    print(f"Plik {PLIK_DO_WGRANIA} wgrany do bazy.")
except Exception as e:
    print(f"Błąd podczas wgrywania do bazy: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
    print("Połączenie zamknięte.")