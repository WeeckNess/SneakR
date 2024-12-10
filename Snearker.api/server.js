const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
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

// Route pour obtenir la liste des produits avec pagination
app.get('/sneakers', (req, res) => {
  const page = parseInt(req.query.page) || 1; // Page demandée, par défaut 1
  const limit = parseInt(req.query.limit) || 12; // Nombre d'éléments par page, par défaut 10
  const offset = (page - 1) * limit;

  const sql = `
    SELECT name, brand, colorway, marketValue, gender, imageOriginale, ImageThumbnail, releaseDate 
    FROM All_SneakR
    LIMIT ? OFFSET ?;
  `;
  const countSql = `SELECT COUNT(*) AS total FROM All_SneakR;`;

  connection.query(countSql, (countErr, countResults) => {
    if (countErr) {
      console.error('Erreur lors du comptage des produits :', countErr.message);
      return res.status(500).send({ error: 'Erreur lors du comptage des produits.' });
    }

    const totalItems = countResults[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    connection.query(sql, [limit, offset], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des produits :', err.message);
        return res.status(500).send({ error: 'Erreur lors de la récupération des produits.' });
      }

      res.send({
        items: results,
        totalPages,
        totalItems,
        currentPage: page
      });
    });
  });
});

app.post('/wishlist', (req, res) => {
    const { userId, productId } = req.body;
  
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId et productId sont requis.' });
    }
  
    const sql = `
      INSERT INTO wishlist (user_id, product_id)
      VALUES (?, ?)
    `;
  
    connection.query(sql, [userId, productId], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'ajout à la wishlist :', err.message);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout à la wishlist.' });
      }
  
      res.status(201).json({ message: 'Produit ajouté à la wishlist.', id: result.insertId });
    });
});

app.get('/wishlist/:userId', (req, res) => {
    const { userId } = req.params;
  
    const sql = `
      SELECT w.id, p.name, p.marketValue, p.imageOriginale, w.created_at
      FROM wishlist w
      JOIN All_SneakR p ON w.product_id = p.id
      WHERE w.user_id = ?
    `;
  
    connection.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération de la wishlist :', err.message);
        return res.status(500).json({ error: 'Erreur lors de la récupération de la wishlist.' });
      }
  
      res.json(results);
    });
});

app.get('/users', (req, res) => {
    const sql = `SELECT id, username, role FROM User`;
  
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des utilisateurs :', err.message);
        return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
      }
  
      res.json(results);
    });
  });

app.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
  
    const sql = `SELECT id, username, role FROM User WHERE id = ?`;

    connection.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', err.message);
        return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur.' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
      res.json(results[0]);
    });
    });


// Route pour gérer la connexion
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: 'Username et mot de passe requis.' });
    }
  
    const sql = `SELECT id, username, password FROM User WHERE username = ?`;
    connection.query(sql, [username], async (err, results) => {
      if (err) {
        console.error('Erreur lors de la connexion :', err.message);
        return res.status(500).json({ error: 'Erreur lors de la connexion.' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Utilisateur introuvable.' });
      }
  
      const user = results[0];
      try {
        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Mot de passe incorrect.' });
        }
  
        // Connecter l'utilisateur
        res.json({ userId: user.id, username: user.username });
      } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe :', error.message);
        return res.status(500).json({ error: 'Erreur lors de la vérification du mot de passe.' });
      }
    });
  });
// Route pour gérer l'inscription
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username et mot de passe requis.' });
  }

  // Hash le mot de passe avant de l'enregistrer
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO User (username, password)
    VALUES (?, ?)
  `;

  connection.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'inscription :', err.message);
      return res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
    }

    res.status(201).json({ userId: result.insertId, username });
  });
});

// Route pour gérer la déconnexion
app.post('/logout', (req, res) => {
  // Effacer la session de l'utilisateur ici, par exemple, en supprimant le cookie ou la session
  res.json({ message: 'Déconnecté.' });
});

// Démarrage du serveur
app.listen(3100, () => {
  console.log('Serveur démarré sur le port 3100');
});