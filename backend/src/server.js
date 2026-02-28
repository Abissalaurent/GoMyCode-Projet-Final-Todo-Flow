import dotenv from "dotenv";
import mongoose from "mongoose";
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🔗 API disponible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Échec du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await mongoose.connection.close();
  console.log('🔌 Connexion MongoDB fermée');
  process.exit(0);
});