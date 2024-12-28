import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Import du module HTTP pour créer le serveur
import { Server } from 'socket.io'; // Import de Socket.IO
import connectToDatabase from './db/db.js';

import departementRouter from './routes/department.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import trajetRouter from './routes/trajet.js';
import travelRouter from './routes/travel.js';
import statRouter from './routes/dataStat.js';

dotenv.config();

const app = express();
const server = createServer(app); // Création du serveur HTTP
const io = new Server(server, {
  cors: {
    origin: '*', // Configurez selon vos besoins (évitez '* en production)
  },
});

// Configuration des en-têtes CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware global
app.use(cors());
app.use(express.json());

// Configuration des routes
app.use('/api/auth', authRouter);
app.use('/api/departement', departementRouter);
app.use('/api/user', userRouter);
app.use('/api/trajet', trajetRouter);
app.use('/api/travel', travelRouter);
app.use('/api/stat', statRouter);

// Initialisation de Socket.IO
io.on('connection', (socket) => {
  console.log(`Nouvelle connexion : ${socket.id}`);

  // Log des événements reçus pour débogage
  socket.onAny((event, ...args) => {
    console.log(`Événement reçu : ${event}`, args);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`Déconnexion : ${socket.id}`);
  });
});


// Connectez-vous à la base de données avant de démarrer le serveur
await connectToDatabase();

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export de l'instance Socket.IO pour l'utiliser dans d'autres fichiers (ex. contrôleurs)
export { io };
