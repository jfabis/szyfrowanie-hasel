const App = {
    async init() {
        await AuthManager.init();

        if (AuthManager.token) {
            this.verifySession();
        }
    },

    async verifySession() {
        try {
            const response = await fetch(`${API_BASE}/auth/verify`, {
                headers: AuthManager.getAuthHeaders()
            });

            if (response.ok) {
                console.log('Session verified');

                if (!AuthManager.encryptionKey) {
                    console.warn('Session valid but encryption key missing');
                }
            } else {
                console.log('Session invalid');
                AuthManager.logout();
            }
        } catch (error) {
            console.error('Session verification error:', error);
            AuthManager.logout();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;
