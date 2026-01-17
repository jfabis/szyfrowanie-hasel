const API_BASE = '/api';
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
let inactivityTimer;

const AuthManager = {
    token: null,
    userId: null,
    userEmail: null,
    userSalt: null,
    encryptionKey: null,

    async init() {
        this.setupInactivityTimer();
        await this.loadSession();
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    },

    showRegisterForm() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    },

    showLoginForm() {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    },

    async handleRegister(e) {
        e.preventDefault();

        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (password !== passwordConfirm) {
            alert('Hasła nie są identyczne!');
            return;
        }

        if (password.length < 8) {
            alert('Hasło musi mieć co najmniej 8 znaków!');
            return;
        }

        try {
            const passwordHash = await CryptoManager.hashPasswordForAuth(password);

            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, passwordHash })
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { error: text };
            }

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            this.token = data.token;
            this.userId = data.userId;
            this.userEmail = email;
            this.userSalt = data.salt;

            this.encryptionKey = await CryptoManager.deriveKey(password, data.salt);

            await this.saveSession(true);

            this.showDashboard();

            PasswordManager.loadPasswords();
        } catch (error) {
            alert(`Błąd rejestracji: ${error.message}`);
        }
    },

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const passwordHash = await CryptoManager.hashPasswordForAuth(password);

            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, passwordHash })
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { error: text };
            }

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            this.token = data.token;
            this.userId = data.userId;
            this.userEmail = email;
            this.userSalt = data.salt;

            this.encryptionKey = await CryptoManager.deriveKey(password, data.salt);

            await this.saveSession(true);

            this.showDashboard();

            PasswordManager.loadPasswords();
        } catch (error) {
            alert(`Błąd logowania: ${error.message}`);
        }
    },

    logout() {
        this.token = null;
        this.userId = null;
        this.userEmail = null;
        this.userSalt = null;
        this.encryptionKey = null;

        sessionStorage.clear();
        this.clearInactivityTimer();

        document.getElementById('auth-view').classList.add('active');
        document.getElementById('dashboard-view').classList.remove('active');

        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();

        this.showLoginForm();
    },

    async saveSession(includeKey = false) {
        sessionStorage.setItem('token', this.token);
        sessionStorage.setItem('userId', this.userId);
        sessionStorage.setItem('userEmail', this.userEmail);
        sessionStorage.setItem('userSalt', this.userSalt);

        if (includeKey && this.encryptionKey) {
            const exportedKey = await window.crypto.subtle.exportKey('raw', this.encryptionKey);
            const keyHex = Array.from(new Uint8Array(exportedKey))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            sessionStorage.setItem('encKey', keyHex);
        }
    },

    async loadSession() {
        this.token = sessionStorage.getItem('token');
        this.userId = sessionStorage.getItem('userId');
        this.userEmail = sessionStorage.getItem('userEmail');
        this.userSalt = sessionStorage.getItem('userSalt');

        const keyHex = sessionStorage.getItem('encKey');
        if (keyHex && this.token) {
            try {
                const keyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                this.encryptionKey = await window.crypto.subtle.importKey(
                    'raw',
                    keyBytes,
                    { name: 'AES-GCM', length: 256 },
                    false,
                    ['encrypt', 'decrypt']
                );

                this.showDashboard();
                PasswordManager.loadPasswords();
            } catch (error) {
                console.error('Failed to restore encryption key:', error);
                this.logout();
            }
        }
    },

    showDashboard() {
        document.getElementById('auth-view').classList.remove('active');
        document.getElementById('dashboard-view').classList.add('active');
        document.getElementById('user-email').textContent = this.userEmail;
    },

    setupInactivityTimer() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const resetTimer = () => {
            this.clearInactivityTimer();
            if (this.token) {
                inactivityTimer = setTimeout(() => {
                    alert('Automatyczne wylogowanie z powodu braku aktywności');
                    this.logout();
                }, INACTIVITY_TIMEOUT);
            }
        };

        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        resetTimer();
    },

    clearInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
    },

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }
};

window.AuthManager = AuthManager;
