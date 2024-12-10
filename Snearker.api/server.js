const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const app = express();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:5173', // Permettre uniquement cette origine
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'] // En-têtes autorisés
}));

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Connexion à MySQL avec gestion des erreurs
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err.message);
    process.exit(1);
  }
  console.log('Connecté à la base de données MySQL.');
});

// Route pour obtenir la liste des produits
app.get('/sneakers', (req, res) => {
  const sql = `
  SELECT name, brand, colorway, marketValue, gender, imageOriginale, ImageThumbnail, releaseDate 
  FROM All_SneakR;`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des produits :', err.message);
      return res.status(500).send({ error: 'Erreur lors de la récupération des produits.' });
    }
    res.send(results);
  });
});

app.get('/users', (req, res) => {
    const sql = `
    SELECT username,role
    FROM User;`;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits :', err.message);
            return res.status(500).send({ error: 'Erreur lors de la récupération des produits.' });
        }
        res.send(results);
        }); 
    });

// Démarrage du serveur
app.listen(3100, () => { // Utilisation d'un port différent (3100 ici)
  console.log('Serveur démarré sur le port 3100');
});