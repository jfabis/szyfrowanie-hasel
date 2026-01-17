# 🔐 Password Manager - Zero-Knowledge Encryption

Bezpieczny menedżer haseł z lokalnym szyfrowaniem. Twoje hasła są chronione szyfrowaniem AES-256 po stronie klienta - serwer nigdy nie ma dostępu do niezaszyfrowanych danych.

## 🎯 Główne Funkcje

- ✅ **Szyfrowanie Zero-Knowledge** - Hasła szyfrowane lokalnie w przeglądarce
- ✅ **AES-256-GCM** - Przemysłowy standard szyfrowania
- ✅ **Generator Haseł** - Generuj silne, losowe hasła
- ✅ **Wyszukiwanie** - Szybko znajdź swoje hasła
- ✅ **Automatyczne Wylogowanie** - Bezpieczeństwo przy braku aktywności (15 min)
- ✅ **Premium Dark Mode UI** - Nowoczesny, elegancki interfejs

## 🚀 Szybki Start

### Wymagania

- Node.js (v14 lub nowszy)
- npm lub yarn

### Instalacja

```bash
# Zainstaluj zależności
npm install

# Uruchom serwer
npm start
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

### Tryb Deweloperski

```bash
npm run dev
```

Serwer automatycznie uruchomi się ponownie po zmianach w kodzie.

## 🏗️ Architektura

### Backend
- **Express.js** - Framework webowy
- **SQLite** - Baza danych
- **Sequelize** - ORM
- **bcrypt** - Haszowanie haseł
- **JWT** - Autoryzacja
- **Helmet** - Bezpieczeństwo headers

### Frontend
- **Vanilla JavaScript** - Bez frameworków
- **Web Crypto API** - Szyfrowanie natywne w przeglądarce
- **Modern CSS** - Glassmorphism, Dark Mode

## 🔒 Bezpieczeństwo

### Jak Działa Szyfrowanie?

1. Użytkownik wprowadza **hasło główne** (Master Password)
2. Z hasła głównego generowany jest **klucz szyfrujący** (PBKDF2, 100,000 iteracji)
3. Każde hasło jest **szyfrowane lokalnie** (AES-256-GCM)
4. Tylko **zaszyfrowane dane** są wysyłane na serwer
5. Serwer **nie może odszyfrować** haseł

### Implementowane Zabezpieczenia

- ✅ Szyfrowanie AES-256-GCM
- ✅ PBKDF2 z 100,000 iteracji
- ✅ Losowe IV dla każdego szyfrowania
- ✅ bcrypt (12 rund) dla haseł uwierzytelniających
- ✅ JWT z 24h wygaśnięciem
- ✅ Rate limiting (ochrona przed brute force)
- ✅ Helmet security headers
- ✅ XSS protection
- ✅ CORS configuration

## ⚠️ Ważne Ostrzeżenia

### 🚨 Zapomnienie Hasła Głównego

> **UWAGA!** Jeśli zapomnisz hasła głównego, **NIE MA MOŻLIWOŚCI** odzyskania twoich haseł. Szyfrowanie jest zaprojektowane tak, że nawet administrator serwera nie może uzyskać dostępu do twoich danych.

### 🔐 HTTPS w Produkcji

> **WYMAGANE!** W środowisku produkcyjnym aplikacja MUSI być serwowana przez HTTPS. HTTP naraża hasło główne podczas transmisji.

## 📁 Struktura Projektu

```
szyfrowanie-hasel/
├── server.js                    # Główny plik serwera
├── config/
│   └── database.js             # Konfiguracja bazy danych
├── models/
│   ├── User.js                 # Model użytkownika
│   └── PasswordEntry.js        # Model wpisu hasła
├── controllers/
│   ├── authController.js       # Logika uwierzytelniania
│   └── passwordController.js   # Logika zarządzania hasłami
├── middleware/
│   └── authMiddleware.js       # Weryfikacja JWT
├── routes/
│   ├── auth.js                 # Ścieżki uwierzytelniania
│   └── passwords.js            # Ścieżki zarządzania hasłami
└── public/
    ├── index.html              # Aplikacja SPA
    ├── css/
    │   └── style.css           # Style Dark Mode
    └── js/
        ├── crypto.js           # Narzędzia szyfrowania
        ├── auth.js             # Obsługa uwierzytelniania
        ├── passwords.js        # Zarządzanie hasłami
        ├── generator.js        # Generator haseł
        └── app.js              # Główny kontroler
```

## 🛠️ API Endpoints

### Uwierzytelnianie
- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/login` - Logowanie
- `GET /api/auth/verify` - Weryfikacja tokenu

### Zarządzanie Hasłami (wymagana autoryzacja)
- `GET /api/passwords` - Pobierz wszystkie hasła
- `POST /api/passwords` - Dodaj nowe hasło
- `PUT /api/passwords/:id` - Aktualizuj hasło
- `DELETE /api/passwords/:id` - Usuń hasło

## 🎨 Interfejs Użytkownika

### Funkcje UI
- **Responsywny design** - Działa na wszystkich urządzeniach
- **Wyszukiwanie** - Szybkie filtrowanie haseł
- **Generator haseł** - Konfigurowalny generator z wskaźnikiem siły
- **Kopiowanie do schowka** - Jedno kliknięcie
- **Ukrywanie haseł** - Kliknij aby pokazać/ukryć
- **Animacje** - Płynne przejścia i efekty hover

### Technologie UI
- Inter Font (Google Fonts)
- CSS Variables dla spójnego themingu
- Glassmorphism effects
- Gradient accents
- Custom scrollbars
- Smooth animations

## 📝 Konfiguracja

### Zmienne Środowiskowe (.env)

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

**Ważne:** Zmień `JWT_SECRET` na losowy, bezpieczny ciąg znaków w produkcji!

## 🧪 Testowanie

Aplikacja została przetestowana pod kątem:
- ✅ Rejestracji i logowania użytkowników
- ✅ Szyfrowania i deszyfrowania haseł
- ✅ Operacji CRUD na hasłach
- ✅ Zasady zero-knowledge (serwer nie może odczytać haseł)
- ✅ Funkcjonalności UI i UX
- ✅ Bezpieczeństwa (rate limiting, XSS protection)

## 🔮 Przyszłe Rozszerzenia

Planowane funkcje (opcjonalne):
- [ ] Export/Import haseł do JSON
- [ ] PWA (Progressive Web App) - obsługa offline
- [ ] Uwierzytelnianie dwuskładnikowe (2FA)
- [ ] Udostępnianie haseł innym użytkownikom
- [ ] Rozszerzenie przeglądarki
- [ ] Aplikacje mobilne (iOS/Android)

## 📄 Licencja

MIT License

## 👨‍💻 Autor

Stworzony jako bezpieczny menedżer haseł z naciskiem na prywatność i bezpieczeństwo.

---

**🔒 Pamiętaj:** Twoje hasła są bezpieczne tylko wtedy, gdy używasz silnego hasła głównego i trzymasz je w tajemnicy!
