

const PasswordGenerator = {

    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',


    init() {
        this.setupEventListeners();
        this.generatePassword(); // Generate initial password
    },


    setupEventListeners() {
        document.getElementById('generate-password-btn').addEventListener('click', () => this.showGenerator());
        document.getElementById('close-generator').addEventListener('click', () => this.closeGenerator());
        document.getElementById('regenerate-password').addEventListener('click', () => this.generatePassword());
        document.getElementById('use-password').addEventListener('click', () => this.usePassword());
        document.getElementById('copy-password').addEventListener('click', () => this.copyPassword());


        document.getElementById('password-length').addEventListener('input', (e) => {
            document.getElementById('length-value').textContent = e.target.value;
            this.generatePassword();
        });


        ['include-uppercase', 'include-lowercase', 'include-numbers', 'include-symbols'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.generatePassword());
        });


        document.getElementById('generator-modal').addEventListener('click', (e) => {
            if (e.target.id === 'generator-modal') {
                this.closeGenerator();
            }
        });
    },


    showGenerator() {
        this.generatePassword();
        document.getElementById('generator-modal').classList.add('active');
    },


    closeGenerator() {
        document.getElementById('generator-modal').classList.remove('active');
    },


    generatePassword() {
        const length = parseInt(document.getElementById('password-length').value);
        const includeUppercase = document.getElementById('include-uppercase').checked;
        const includeLowercase = document.getElementById('include-lowercase').checked;
        const includeNumbers = document.getElementById('include-numbers').checked;
        const includeSymbols = document.getElementById('include-symbols').checked;


        let charset = '';
        if (includeUppercase) charset += this.uppercase;
        if (includeLowercase) charset += this.lowercase;
        if (includeNumbers) charset += this.numbers;
        if (includeSymbols) charset += this.symbols;

        if (charset.length === 0) {

            document.getElementById('include-lowercase').checked = true;
            charset = this.lowercase;
        }


        let password = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }


        if (includeUppercase && !this.containsChar(password, this.uppercase)) {
            password = this.replaceRandomChar(password, this.getRandomChar(this.uppercase));
        }
        if (includeLowercase && !this.containsChar(password, this.lowercase)) {
            password = this.replaceRandomChar(password, this.getRandomChar(this.lowercase));
        }
        if (includeNumbers && !this.containsChar(password, this.numbers)) {
            password = this.replaceRandomChar(password, this.getRandomChar(this.numbers));
        }
        if (includeSymbols && !this.containsChar(password, this.symbols)) {
            password = this.replaceRandomChar(password, this.getRandomChar(this.symbols));
        }

        document.getElementById('generated-password').value = password;
        this.updateStrengthIndicator(password, length);
    },


    updateStrengthIndicator(password, length) {
        let strength = 0;


        if (length >= 16) strength += 40;
        else if (length >= 12) strength += 30;
        else if (length >= 8) strength += 20;


        if (this.containsChar(password, this.uppercase)) strength += 15;
        if (this.containsChar(password, this.lowercase)) strength += 15;
        if (this.containsChar(password, this.numbers)) strength += 15;
        if (this.containsChar(password, this.symbols)) strength += 15;

        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (strength >= 75) {
            strengthFill.className = 'strength-fill strong';
            strengthText.textContent = 'Bardzo silne';
            strengthText.style.color = '#10b981';
        } else if (strength >= 50) {
            strengthFill.className = 'strength-fill medium';
            strengthText.textContent = 'Średnie';
            strengthText.style.color = '#f59e0b';
        } else {
            strengthFill.className = 'strength-fill weak';
            strengthText.textContent = 'Słabe';
            strengthText.style.color = '#ef4444';
        }
    },


    usePassword() {
        const password = document.getElementById('generated-password').value;
        document.getElementById('password-password').value = password;
        this.closeGenerator();
    },


    async copyPassword() {
        const password = document.getElementById('generated-password').value;

        try {
            await navigator.clipboard.writeText(password);


            const btn = document.getElementById('copy-password');
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.style.color = '';
            }, 1000);
        } catch (error) {
            alert('Błąd kopiowania do schowka');
        }
    },


    containsChar(password, charset) {
        return charset.split('').some(char => password.includes(char));
    },


    getRandomChar(charset) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return charset[array[0] % charset.length];
    },


    replaceRandomChar(password, newChar) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const index = array[0] % password.length;
        return password.substring(0, index) + newChar + password.substring(index + 1);
    }
};

window.PasswordGenerator = PasswordGenerator;


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PasswordGenerator.init());
} else {
    PasswordGenerator.init();
}
