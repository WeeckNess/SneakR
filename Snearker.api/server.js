const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv').config(); // Load environment variables
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

// Servir les fichiers statiques dans le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware pour authentifier le token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Jeton invalide ou expiré.' });
    req.user = user;
    next();
  });
}

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

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
app.get('/sneakers', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countSql = `SELECT COUNT(*) AS total FROM All_SneakR;`;

  try {
    const [countResults] = await connection.promise().query(countSql);
    const totalItems = countResults[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const sql = `SELECT * FROM All_SneakR LIMIT ? OFFSET ?`;
    const [results] = await connection.promise().query(sql, [limit, offset]);
    res.json({ items: results, totalPages, totalItems, currentPage: page });
  } catch (err) {
    console.error('Erreur lors de la récupération des produits :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
});

// Route to get wishlist for the authenticated user
app.get('/wishlist', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT w.id, p.name, p.marketValue, p.imageOriginale, w.created_at
    FROM wishlist w
    JOIN All_SneakR p ON w.product_id = p.id
    WHERE w.user_id = ?
  `;

  try {
    const [results] = await connection.promise().query(sql, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération de la wishlist :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération de la wishlist.' });
  }
});

// Route to add a sneaker to the wishlist (authentication required)
app.post('/wishlist', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  const sql = `INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)`;

  connection.query(sql, [userId, productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du produit à la wishlist.' });
    }

    res.status(201).json({ message: 'Produit ajouté à la wishlist avec succès.' });
  });
});

// Route to remove a product from the wishlist (authentication required)
app.delete('/wishlist/:wishlistId', authenticateToken, (req, res) => {
  const wishlistId = req.params.wishlistId;

  const sql = `DELETE FROM wishlist WHERE id = ?`;

  connection.query(sql, [wishlistId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du retrait du produit de la wishlist.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé dans la wishlist.' });
    }

    res.status(200).json({ message: 'Produit retiré de la wishlist avec succès.' });
  });
});

// Route to clear the wishlist (authentication required)
app.delete('/wishlist', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `DELETE FROM wishlist WHERE user_id = ?`;

  connection.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du vidage de la wishlist.' });
    }

    res.status(200).json({ message: 'Wishlist vidée avec succès.' });
  });
});

// Route to upload profile image
app.post('/upload-profile-image', authenticateToken, upload.single('profileImage'), (req, res) => {
  const userId = req.user.id;
  const imageUrl = `/uploads/${req.file.filename}`;

  const sql = `UPDATE User SET profile_image = ? WHERE id = ?`;

  connection.query(sql, [imageUrl, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du téléchargement de l\'image de profil.' });
    }

    res.status(201).json({ imageUrl });
  });
});

// Route to get profile image for a specific user
app.get('/profile-image/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT profile_image FROM User WHERE id = ?`;

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'image de profil :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'image de profil.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Image de profil non trouvée.' });
    }

    res.json({ imageUrl: results[0].profile_image });
  });
});

// Route to search sneakers with filters
app.get('/search', (req, res) => {
  const { brand, minMarketValue, maxMarketValue, gender } = req.query;

  let sql = `SELECT * FROM All_SneakR WHERE 1=1`;
  const params = [];

  if (brand) {
    sql += ` AND brand = ?`;
    params.push(brand);
  }

  if (minMarketValue) {
    sql += ` AND marketValue >= ?`;
    params.push(minMarketValue);
  }

  if (maxMarketValue) {
    sql += ` AND marketValue <= ?`;
    params.push(maxMarketValue);
  }

  if (gender) {
    sql += ` AND gender = ?`;
    params.push(gender);
  }

  connection.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la recherche des produits.' });
    }

    res.json(results);
  });
});

// Démarrage du serveur
app.listen(process.env.PORT, () => {
  console.log(`Serveur en écoute sur le port ${process.env.PORT}`);
});