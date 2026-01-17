const CryptoManager = {
    async deriveKey(masterPassword, saltHex) {
        const enc = new TextEncoder();
        const passwordBuffer = enc.encode(masterPassword);

        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        const salt = this.hexToBuffer(saltHex);

        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        return key;
    },

    async encrypt(data, key) {
        const enc = new TextEncoder();
        const dataBuffer = enc.encode(JSON.stringify(data));

        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            dataBuffer
        );

        return {
            encrypted: this.bufferToHex(new Uint8Array(encryptedBuffer)),
            iv: this.bufferToHex(iv)
        };
    },

    async decrypt(encryptedHex, ivHex, key) {
        try {
            const encrypted = this.hexToBuffer(encryptedHex);
            const iv = this.hexToBuffer(ivHex);

            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encrypted
            );

            const dec = new TextDecoder();
            const decryptedJson = dec.decode(decryptedBuffer);
            return JSON.parse(decryptedJson);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data. Invalid key or corrupted data.');
        }
    },

    bufferToHex(buffer) {
        return Array.from(buffer)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    hexToBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    },

    generateSalt() {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        return this.bufferToHex(salt);
    },

    async hashPasswordForAuth(password) {
        const enc = new TextEncoder();
        const data = enc.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        return this.bufferToHex(new Uint8Array(hashBuffer));
    }
};

window.CryptoManager = CryptoManager;
