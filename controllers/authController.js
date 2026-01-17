const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const SALT_ROUNDS = 12;

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.register = async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        if (!email || !passwordHash) {
            return res.status(400).json({ error: 'Email and password hash are required' });
        }


        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }


        const salt = crypto.randomBytes(16).toString('hex');


        const hashedPassword = await bcrypt.hash(passwordHash, SALT_ROUNDS);


        const user = await User.create({
            email,
            passwordHash: hashedPassword,
            salt,
        });


        const token = generateToken(user.id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            userId: user.id,
            salt,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        if (!email || !passwordHash) {
            return res.status(400).json({ error: 'Email and password hash are required' });
        }


        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }


        const isValidPassword = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }


        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            token,
            userId: user.id,
            salt: user.salt,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'email', 'salt'],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            valid: true,
            userId: user.id,
            email: user.email,
            salt: user.salt,
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ error: 'Token verification failed' });
    }
};
