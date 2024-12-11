const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const app = express();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Connexion à MySQL
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

// Configuration de multer pour les uploads de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.get('/sneakers', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countSql = `SELECT COUNT(*) AS total FROM All_SneakR;`;

  connection.query(countSql, (countErr, countResults) => {
    if (countErr) {
      return res.status(500).json({ error: 'Erreur lors du comptage des produits.' });
    }

    const totalItems = countResults[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const sql = `SELECT * FROM All_SneakR LIMIT ? OFFSET ?`;
    connection.query(sql, [limit, offset], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
      }

      res.json({ items: results, totalPages, totalItems, currentPage: page });
    });
  });
});

// Servir les fichiers statiques dans le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware pour authentifier le token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route de connexion
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM User WHERE username = ?`;
  connection.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la connexion.' });

    if (results.length === 0) return res.status(401).json({ error: 'Utilisateur non trouvé.' });

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, userId: user.id, username: user.username });
  });
});

// Route d'inscription
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Username et mot de passe requis.' });

  const sql = `INSERT INTO User (username, password) VALUES (?, ?)`;

  connection.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de l\'inscription.' });

    res.status(201).json({ userId: result.insertId, username });
  });
});

// Route pour récupérer la wishlist de l'utilisateur
app.get('/wishlist', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT w.id AS wishlistId, p.name, p.marketValue, p.imageOriginale, w.created_at
    FROM wishlist w
    JOIN All_SneakR p ON w.product_id = p.id
    WHERE w.user_id = ?
  `;

  connection.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la récupération de la wishlist.' });

    res.json(results);
  });
});

// Route pour ajouter un produit à la wishlist
app.post('/wishlist', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ error: 'Product ID is required.' });

  const sql = `INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)`;

  connection.query(sql, [userId, productId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de l\'ajout du produit à la wishlist.' });

    res.status(201).json({ message: 'Produit ajouté à la wishlist avec succès.' });
  });
});

// Route pour retirer un produit de la wishlist
app.delete('/wishlist/:wishlistId', authenticateToken, (req, res) => {
  const wishlistId = req.params.wishlistId;

  const sql = `DELETE FROM wishlist WHERE id = ?`;

  connection.query(sql, [wishlistId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors du retrait du produit de la wishlist.' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Produit non trouvé dans la wishlist.' });

    res.status(200).json({ message: 'Produit retiré de la wishlist avec succès.' });
  });
});

// Route pour uploader une image de profil
app.post('/upload-profile-image', authenticateToken, upload.single('profileImage'), (req, res) => {
  const userId = req.user.id;
  const imageUrl = `/uploads/${req.file.filename}`;

  const sql = `INSERT INTO Media (user_id, image_url) VALUES (?, ?)`;

  connection.query(sql, [userId, imageUrl], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors du téléchargement de l\'image de profil.' });

    res.status(201).json({ imageUrl });
  });
});

// Route pour récupérer l'image de profil d'un utilisateur
app.get('/profile-image/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT image_url FROM Media WHERE user_id = ? ORDER BY id DESC LIMIT 1`;

  connection.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la récupération de l\'image de profil.' });

    if (results.length === 0) return res.status(404).json({ error: 'Image de profil non trouvée.' });

    res.json({ imageUrl: results[0].image_url });
  });
});

// Démarrer le serveur
app.listen(3100, () => {
  console.log('Serveur démarré sur le port 3100');
});