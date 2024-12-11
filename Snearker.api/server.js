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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM User WHERE username = ?`;
  connection.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la connexion.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, userId: user.id, username: user.username });
  });
});

// Register route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username et mot de passe requis.' });
  }

  const sql = `INSERT INTO User (username, password) VALUES (?, ?)`;

  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
    }

    res.status(201).json({ userId: result.insertId, username });
  });
});

// Route to get all sneakers with pagination
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

// Route to get wishlist for a specific user (authentication required)
app.get('/wishlist/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;

  if (req.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Accès interdit à cette wishlist.' });
  }

  const sql = `
    SELECT w.id, p.name, p.marketValue, p.imageOriginale, w.created_at
    FROM wishlist w
    JOIN All_SneakR p ON w.product_id = p.id
    WHERE w.user_id = ?
  `;

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération de la wishlist.' });
    }

    res.json(results);
  });
});

// Route to get all wishlists
app.get('/wishlist', (req, res) => {
  const sql = `
    SELECT w.id, w.user_id, p.name, p.marketValue, p.imageOriginale, w.created_at
    FROM wishlist w
    JOIN All_SneakR p ON w.product_id = p.id
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des wishlists :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des wishlists.' });
    }

    res.status(200).json({ wishlists: results });
  });
});

// Route to upload profile image
app.post('/upload-profile-image', authenticateToken, upload.single('profileImage'), (req, res) => {
  const userId = req.user.id;
  const imageUrl = `/uploads/${req.file.filename}`;

  const sql = `INSERT INTO Media (user_id, image_url) VALUES (?, ?)`;

  connection.query(sql, [userId, imageUrl], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du téléchargement de l\'image de profil.' });
    }

    res.status(201).json({ imageUrl });
  });
});

// Route to get profile image for a specific user
app.get('/profile-image/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT image_url FROM Media WHERE user_id = ? ORDER BY id DESC LIMIT 1`;

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'image de profil.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Image de profil non trouvée.' });
    }

    res.json({ imageUrl: results[0].image_url });
  });
});

// Middleware to authenticate token
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

// Start the server
app.listen(3100, () => {
  console.log('Serveur démarré sur le port 3100');
});