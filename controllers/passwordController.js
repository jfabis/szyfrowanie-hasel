const PasswordEntry = require('../models/PasswordEntry');

exports.getAllPasswords = async (req, res) => {
    try {
        const passwords = await PasswordEntry.findAll({
            where: { userId: req.userId },
            attributes: ['id', 'encryptedData', 'iv', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
        });

        res.json(passwords);
    } catch (error) {
        console.error('Get passwords error:', error);
        res.status(500).json({ error: 'Failed to fetch passwords' });
    }
};

exports.createPassword = async (req, res) => {
    try {
        const { encryptedData, iv } = req.body;

        if (!encryptedData || !iv) {
            return res.status(400).json({ error: 'Encrypted data and IV are required' });
        }

        const passwordEntry = await PasswordEntry.create({
            userId: req.userId,
            encryptedData,
            iv,
        });

        res.status(201).json({
            message: 'Password saved successfully',
            id: passwordEntry.id,
            encryptedData: passwordEntry.encryptedData,
            iv: passwordEntry.iv,
            createdAt: passwordEntry.createdAt,
            updatedAt: passwordEntry.updatedAt,
        });
    } catch (error) {
        console.error('Create password error:', error);
        res.status(500).json({ error: 'Failed to save password' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { encryptedData, iv } = req.body;

        if (!encryptedData || !iv) {
            return res.status(400).json({ error: 'Encrypted data and IV are required' });
        }

        const passwordEntry = await PasswordEntry.findOne({
            where: { id, userId: req.userId },
        });

        if (!passwordEntry) {
            return res.status(404).json({ error: 'Password entry not found' });
        }

        await passwordEntry.update({ encryptedData, iv });

        res.json({
            message: 'Password updated successfully',
            id: passwordEntry.id,
            encryptedData: passwordEntry.encryptedData,
            iv: passwordEntry.iv,
            updatedAt: passwordEntry.updatedAt,
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};

exports.deletePassword = async (req, res) => {
    try {
        const { id } = req.params;

        const passwordEntry = await PasswordEntry.findOne({
            where: { id, userId: req.userId },
        });

        if (!passwordEntry) {
            return res.status(404).json({ error: 'Password entry not found' });
        }

        await passwordEntry.destroy();

        res.json({ message: 'Password deleted successfully' });
    } catch (error) {
        console.error('Delete password error:', error);
        res.status(500).json({ error: 'Failed to delete password' });
    }
};
