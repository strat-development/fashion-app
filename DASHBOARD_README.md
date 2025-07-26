# Fashion App Dashboard

## Opis

Dashboard aplikacji fashion zawiera kompleksowy system zarządzania outfitami, profilu użytkownika oraz społecznościowych funkcji. 

## Funkcjonalności

### 🎨 Dashboard
- **Feed** - Główny strumień outfitów z możliwością lajkowania, komentowania i udostępniania
- **Saved** - Zapisane outfity użytkownika
- **Created** - Outfity stworzone przez użytkownika
- **Profile** - Profil użytkownika ze statystykami i aktywnością

### 📱 Komponenty

#### OutfitCard
- Wyświetlanie outfitu z obrazkiem, tagami, statystykami
- Akcje: like, save, comment, share
- Możliwość kliknięcia w celu otworzenia szczegółów

#### OutfitDetail
- Pełnoekranowy widok outfitu
- System komentarzy z możliwością dodawania
- Rozszerzone akcje społecznościowe

#### UserProfile
- Wyświetlanie informacji o użytkowniku
- Statystyki (created, saved, likes, followers)
- Historia aktywności
- Możliwość edycji profilu

#### ProfileEdit
- Edycja nazwy użytkownika i bio
- Upload zdjęcia profilowego (placeholder)
- Ustawienia prywatności

#### OutfitCreate
- Tworzenie nowego outfitu
- Upload wielu zdjęć
- Wybór tagów, kolorów, elementów stroju
- Opis i tytuł

#### EmptyState
- Uniwersalny komponent dla pustych stanów
- Ikona, tytuł, opis, opcjonalny przycisk akcji

### 🎯 Mockowe dane

Aplikacja używa mockowych danych dla:
- Outfity z różnymi stylami (Casual, Business, Street Style, Elegant)
- Komentarze użytkowników
- Statystyki użytkownika
- Historia aktywności

### 🔧 Technologie

- **React Native** z TypeScript
- **Expo Router** do nawigacji
- **NativeWind** do stylowania (Tailwind CSS)
- **Lucide React Native** do ikon
- **React Native Elements** do niektórych komponentów UI

### 🎨 Design

- **Apple-like premium design** z glassmorphism efektami
- Gradientowe tło (gray-900 → purple-900 → violet-900)
- Przezroczyste karty z backdrop-blur
- Smooth animacje i przejścia
- Konsystentny system kolorów

### 📁 Struktura plików

```
components/dashboard/
├── OutfitCard.tsx      # Karta outfitu
├── OutfitDetail.tsx    # Szczegóły outfitu
├── UserProfile.tsx     # Profil użytkownika
├── ProfileEdit.tsx     # Edycja profilu
├── OutfitCreate.tsx    # Tworzenie outfitu
└── EmptyState.tsx      # Pusty stan

app/(tabs)/
└── dashboard.tsx       # Główny komponent dashboard
```

### 🔄 Stan aplikacji

Dashboard zarządza następującymi stanami:
- `activeTab` - aktywna zakładka (feed/saved/created/profile)
- `outfits` - lista outfitów
- `selectedOutfit` - wybrany outfit do szczegółów
- `profileData` - dane profilu użytkownika
- `showModals` - stany modali (detail, edit, create)

### 🚀 Następne kroki

Funkcjonalności do implementacji z Supabase:
1. Autentykacja użytkowników
2. Baza danych outfitów
3. System komentarzy
4. Upload zdjęć
5. Follower system
6. Real-time updates
7. Push notifications
8. Search i filtry

### 🎭 Mock data do zastąpienia

```typescript
// Outfity - zastąpić danymi z Supabase
mockOutfits: OutfitData[]

// Statystyki użytkownika - pobrać z bazy
mockUserStats: UserStats

// Komentarze - system bazy danych
mockComments: Comment[]
```

## Instalacja i uruchomienie

```bash
# Zainstaluj zależności
npm install

# Uruchom aplikację
npm start
```

## Uwagi

- Wszystkie modalne komponenty używają `Modal` z React Native
- Design jest responsywny i działa na iOS/Android
- Używane są placeholder obrazy z via.placeholder.com
- Komponenty są w pełni typowane TypeScript
