const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
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

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM User WHERE username = ?`;
  connection.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la connexion.' });

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const user = results[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user.id, username: user.username, email: user.email });
  });
});

// Middleware pour vérifier si un utilisateur est administrateur
function checkAdmin(req, res, next) {
  const userId = req.user.id;

  const sql = `SELECT role FROM User WHERE id = ?`;
  connection.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la vérification des autorisations.' });
    }

    if (results.length === 0 || results[0].role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Rôle admin requis.' });
    }

    next();
  });
}

// Route pour accéder à la page admin si l'utilisateur a le rôle admin
app.get('/admin', authenticateToken, checkAdmin, (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur la page admin.' });
});

// Routes d’administration pour gérer les utilisateurs
app.get('/admin/users', authenticateToken, checkAdmin, (req, res) => {
  const sql = `SELECT id, username, role FROM User`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }

    res.json(results);
  });
});

app.put('/admin/users/:id', authenticateToken, checkAdmin, (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!role) {
    return res.status(400).json({ error: 'Role requis.' });
  }

  const sql = `UPDATE User SET role = ? WHERE id = ?`;

  connection.query(sql, [role, id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du rôle :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle.' });
    }

    res.status(200).json({ message: 'Rôle mis à jour avec succès.' });
  });
});

app.delete('/admin/users/:id', authenticateToken, checkAdmin, (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM User WHERE id = ?`;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur.' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  });
});

// Route pour envoyer la collection par e-mail
app.post('/send-collection-email', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const recipientEmail = req.body.recipientEmail;

  if (!recipientEmail) {
    return res.status(400).json({ error: "L'adresse e-mail du destinataire est requise." });
  }

  const getUserEmailSql = `SELECT email FROM User WHERE id = ?`;
  const getUserCollectionSql = `SELECT p.name, p.marketValue FROM Collection c JOIN All_SneakR p ON c.product_id = p.id WHERE c.user_id = ?`;

  connection.query(getUserEmailSql, [userId], (err, userResults) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'e-mail de l'utilisateur :", err.message);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const userEmail = userResults[0].email;

    connection.query(getUserCollectionSql, [userId], (err, collectionResults) => {
      if (err) {
        console.error("Erreur lors de la récupération de la collection :", err.message);
        return res.status(500).json({ error: 'Erreur interne du serveur.' });
      }

      if (collectionResults.length === 0) {
        return res.status(404).json({ error: 'Aucun produit trouvé dans la collection de l\'utilisateur.' });
      }

      // Formater la collection pour l'inclure dans le texte de l'e-mail
      const formattedCollection = collectionResults
        .map((product) => `- ${product.name}: ${product.marketValue}€`)
        .join('\n');

      // Configuration de l'envoi d'e-mail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // E-mail de l'application
          pass: process.env.EMAIL_PASSWORD, // Mot de passe ou clé de l'application
        },
      });

      const mailOptions = {
        from: userEmail, // Utiliser l'e-mail de l'utilisateur comme expéditeur
        to: recipientEmail, // Adresse e-mail saisie dans le frontend
        subject: 'Votre Collection',
        text: `Bonjour,\n\nVoici votre collection :\n\n${formattedCollection}\n\nCordialement,\nL'équipe SneakR.`,
      };

      // Envoi de l'e-mail
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Erreur lors de l'envoi de l'e-mail :", error.message);
          return res.status(500).json({ error: "Erreur lors de l'envoi de l'e-mail." });
        }
        console.log("E-mail envoyé avec succès :", info.response);
        res.status(200).json({ message: "E-mail envoyé avec succès." });
      });
    });
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
      console.error('Erreur lors de l\'inscription:', err.message);
      return res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
    }

    res.status(201).json({ userId: result.insertId, username });
  });
});

app.get('/sneakers', (req, res) => {
  const { page = 1, limit = 10, brand, minMarketValue, maxMarketValue, gender, character } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Construire la requête de récupération avec filtres
  let sql = `SELECT * FROM All_SneakR WHERE 1=1`;
  const params = [];

  if (brand) {
    sql += ` AND brand = ?`;
    params.push(brand);
  }

  if (minMarketValue) {
    sql += ` AND marketValue >= ?`;
    params.push(parseFloat(minMarketValue));
  }

  if (maxMarketValue) {
    sql += ` AND marketValue <= ?`;
    params.push(parseFloat(maxMarketValue));
  }

  if (gender) {
    sql += ` AND gender = ?`;
    params.push(gender);
  }

  if (character && character.trim() !== '') {
    sql += ` AND name LIKE ?`;
    params.push(`%${character}%`);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  // Exécuter la requête principale
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des produits :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
    }

    // Construire la requête de comptage total avec les mêmes filtres
    let countSql = `SELECT COUNT(*) AS total FROM All_SneakR WHERE 1=1`;
    const countParams = params.slice(0, -2); // Exclure LIMIT et OFFSET pour le comptage

    connection.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error('Erreur lors du comptage des produits :', countErr.message);
        return res.status(500).json({ error: 'Erreur lors du comptage des produits.' });
      }

      const totalItems = countResults[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Retourner les résultats avec les informations de pagination
      res.json({
        items: results,
        totalPages,
        totalItems,
        currentPage: parseInt(page),
      });
    });
  });
});

app.get('/collection', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql=`
    SELECT c.id, p.name, p.marketValue, p.imageOriginale, c.created_at
    FROM collection c
    JOIN All_SneakR p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  connection.query(sql, [userId], (err, results) => {
    if  (err) {
      console.error('Erreur lors de la récupération de la collection :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération de la collection.' });
    }
    res.json(results);
  });
});

app.post('/collection', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const {productId} = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  const sql = `INSERT INTO collection (user_id, product_id) VALUES (?, ?)`;

  connection.query(sql, [userId, productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du produit à la collection.' });
    }

    res.status(201).json({ message: 'Produit ajouté à la collection avec succès.' });
  });
});

app.delete('/collection/:collectionId', authenticateToken, (req, res) => {
  const collectionId = req.params.collectionId;

  const sql = `DELETE FROM collection WHERE id = ?`;

  connection.query(sql, [collectionId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du retrait du produit de la collection.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé dans la collection.' });
    }

    res.status(200).json({ message: 'Produit retiré de la collection avec succès.' });
  });
});

app.delete('/collection', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `DELETE FROM collection WHERE user_id = ?`;

  connection.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du vidage de la collection.' });
    }

    res.status(200).json({ message: 'Collection vidée avec succès.' });
  });
});

// Route to get wishlist for the authenticated user
app.get('/wishlist', authenticateToken, (req, res) => {
  const userId = req.user.id;

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

// Start the server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});