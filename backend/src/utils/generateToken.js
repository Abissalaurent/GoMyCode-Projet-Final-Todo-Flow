// Importation de jsonwebtoken pour la génération de tokens d'authentification
import jwt from 'jsonwebtoken';

// Fonction utilitaire pour générer un token JWT à partir de l'ID de l'utilisateur
export function generateToken(userId) {
    const payload = { id: userId };
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
}