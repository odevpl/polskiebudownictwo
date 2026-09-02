# Migracja Akademii

## Kolejność wdrożenia

1. Wykonaj backup bazy produkcyjnej.
2. Wdróż kod zawierający `sql/schema.sql` oraz modele Akademii.
3. Uruchom `npm run migrate` z konfiguracją docelowej bazy danych.
4. Sprawdź, czy istnieją tabele `courses`, `course_lessons`, `user_course_access` i `user_lesson_progress`.
5. Na każdym środowisku utwórz właściwe kursy przez panel administracyjny.

Migracja jest idempotentna: można ją uruchomić ponownie bez tworzenia tabel od początku. Aplikacja nie posiada seeda kursów — dane Akademii pochodzą wyłącznie z bazy i panelu administracyjnego.

## Weryfikacja po migracji

- kurs ma unikalny `slug`,
- lekcja należy do istniejącego kursu,
- dostęp wskazuje istniejącego użytkownika i kurs,
- postęp wskazuje istniejącego użytkownika i lekcję,
- wygasły lub cofnięty dostęp nie jest traktowany jako aktywny.
