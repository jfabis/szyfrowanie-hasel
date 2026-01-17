const PasswordManager = {
    passwords: [],
    currentEditId: null,

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('add-password-btn').addEventListener('click', () => this.showAddModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('password-form').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('toggle-password-visibility').addEventListener('click', () => this.togglePasswordVisibility());
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e));

        document.getElementById('password-modal').addEventListener('click', (e) => {
            if (e.target.id === 'password-modal') {
                this.closeModal();
            }
        });
    },

    async loadPasswords() {
        try {
            const response = await fetch(`${API_BASE}/passwords`, {
                headers: AuthManager.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load passwords');
            }

            const encryptedPasswords = await response.json();

            this.passwords = [];
            for (const entry of encryptedPasswords) {
                try {
                    const decrypted = await CryptoManager.decrypt(
                        entry.encryptedData,
                        entry.iv,
                        AuthManager.encryptionKey
                    );

                    this.passwords.push({
                        id: entry.id,
                        service: decrypted.service,
                        username: decrypted.username,
                        password: decrypted.password,
                        notes: decrypted.notes || '',
                        createdAt: entry.createdAt,
                        updatedAt: entry.updatedAt
                    });
                } catch (error) {
                    console.error('Failed to decrypt password entry:', entry.id);
                }
            }

            this.renderPasswords();
        } catch (error) {
            console.error('Load passwords error:', error);
            alert('Błąd wczytywania haseł');
        }
    },

    renderPasswords(filteredPasswords = null) {
        const container = document.getElementById('passwords-list');
        const emptyState = document.getElementById('empty-state');
        const passwordsToRender = filteredPasswords || this.passwords;

        container.innerHTML = '';

        if (passwordsToRender.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        passwordsToRender.forEach(pwd => {
            const card = this.createPasswordCard(pwd);
            container.appendChild(card);
        });
    },

    createPasswordCard(pwd) {
        const card = document.createElement('div');
        card.className = 'password-card';
        card.innerHTML = `
            <div class="password-card-header">
                <div>
                    <div class="password-card-title">${this.escapeHtml(pwd.service)}</div>
                    <div class="password-card-username">${this.escapeHtml(pwd.username)}</div>
                </div>
                <div class="password-card-actions">
                    <button class="action-btn btn-copy" data-id="${pwd.id}" title="Kopiuj hasło">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                        </svg>
                    </button>
                    <button class="action-btn btn-edit" data-id="${pwd.id}" title="Edytuj">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" data-id="${pwd.id}" title="Usuń">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="password-card-field">
                <div class="password-card-label">Hasło</div>
                <div class="password-card-value password-hidden password-toggle" data-id="${pwd.id}">
                    ${this.escapeHtml(pwd.password)}
                </div>
            </div>
            ${pwd.notes ? `
                <div class="password-card-field">
                    <div class="password-card-label">Notatki</div>
                    <div class="password-card-value">${this.escapeHtml(pwd.notes)}</div>
                </div>
            ` : ''}
        `;

        const copyBtn = card.querySelector('.btn-copy');
        const editBtn = card.querySelector('.btn-edit');
        const deleteBtn = card.querySelector('.btn-delete');
        const passwordToggle = card.querySelector('.password-toggle');

        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyPassword(pwd.id, copyBtn);
        });

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editPassword(pwd.id);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deletePassword(pwd.id);
        });

        passwordToggle.addEventListener('click', () => {
            passwordToggle.classList.toggle('password-hidden');
        });

        return card;
    },

    showAddModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Dodaj hasło';
        document.getElementById('password-form').reset();
        document.getElementById('password-modal').classList.add('active');
    },

    editPassword(id) {
        const pwd = this.passwords.find(p => p.id === id);
        if (!pwd) return;

        this.currentEditId = id;
        document.getElementById('modal-title').textContent = 'Edytuj hasło';
        document.getElementById('password-service').value = pwd.service;
        document.getElementById('password-username').value = pwd.username;
        document.getElementById('password-password').value = pwd.password;
        document.getElementById('password-notes').value = pwd.notes || '';
        document.getElementById('password-modal').classList.add('active');
    },

    closeModal() {
        document.getElementById('password-modal').classList.remove('active');
        document.getElementById('password-form').reset();
        this.currentEditId = null;
    },

    async handleSubmit(e) {
        e.preventDefault();

        const data = {
            service: document.getElementById('password-service').value,
            username: document.getElementById('password-username').value,
            password: document.getElementById('password-password').value,
            notes: document.getElementById('password-notes').value
        };

        try {
            const { encrypted, iv } = await CryptoManager.encrypt(data, AuthManager.encryptionKey);

            const payload = {
                encryptedData: encrypted,
                iv: iv
            };

            let response;
            if (this.currentEditId) {
                response = await fetch(`${API_BASE}/passwords/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: AuthManager.getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_BASE}/passwords`, {
                    method: 'POST',
                    headers: AuthManager.getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save password');
            }

            this.closeModal();
            await this.loadPasswords();
        } catch (error) {
            console.error('Save password error:', error);
            alert('Błąd zapisywania hasła');
        }
    },

    async deletePassword(id) {
        const confirmed = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(confirm('Czy na pewno chcesz usunąć to hasło?'));
            }, 10);
        });

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/passwords/${id}`, {
                method: 'DELETE',
                headers: AuthManager.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to delete password');
            }

            await this.loadPasswords();
        } catch (error) {
            console.error('Delete password error:', error);
            alert('Błąd usuwania hasła');
        }
    },

    async copyPassword(id, btnElement) {
        const pwd = this.passwords.find(p => p.id === id);
        if (!pwd) return;

        try {
            await navigator.clipboard.writeText(pwd.password);

            if (btnElement) {
                btnElement.style.color = '#10b981';
                setTimeout(() => {
                    btnElement.style.color = '';
                }, 1000);
            }
        } catch (error) {
            alert('Błąd kopiowania do schowka');
        }
    },

    togglePasswordVisibility() {
        const input = document.getElementById('password-password');
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
    },

    handleSearch(e) {
        const query = e.target.value.toLowerCase();

        if (!query) {
            this.renderPasswords();
            return;
        }

        const filtered = this.passwords.filter(pwd =>
            pwd.service.toLowerCase().includes(query) ||
            pwd.username.toLowerCase().includes(query) ||
            (pwd.notes && pwd.notes.toLowerCase().includes(query))
        );

        this.renderPasswords(filtered);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.PasswordManager = PasswordManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PasswordManager.init());
} else {
    PasswordManager.init();
}
