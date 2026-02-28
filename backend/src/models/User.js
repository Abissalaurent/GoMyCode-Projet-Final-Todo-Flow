// Importation de mongoose pour la création du schéma de données et du modèle User
import mongoose from 'mongoose';

// Importation de bcrypt pour le hachage de mots de passe
import bcrypt from 'bcrypt';

// Définition du schéma de données pour les utilisateurs (User)
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Middleware pour hacher le mot de passe avant de sauvegarder un utilisateur
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer un mot de passe candidat avec le mot de passe haché stocké dans la base de données
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

