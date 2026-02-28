import User from '../models/User.js'; // Importation du modèle User
import { generateToken } from '../utils/generateToken.js'; // Importation de la fonction generateToken

/**
 * REGISTER
 */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required',
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({
                message: 'Email already in use',
            });
        }

        const user = await User.create({ name, email, password });

        const token = generateToken(user._id);

        return res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
};


/**
 * LOGIN
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        const token = generateToken(user._id);

        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
};