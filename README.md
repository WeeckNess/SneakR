SneakR - Epitech Digital School Project

SneakR est une application web développée dans le cadre d'un projet académique visant à apprendre la gestion d'une grosse base de données et son intégration avec un site web moderne. Ce projet met en œuvre un frontend en Vue.js et un backend avec une base de données gérée via Docker.

🚀 Lancer le projet

📌 Prérequis

Assurez-vous d'avoir les éléments suivants installés sur votre machine :

Node.js (pour le développement en Vue.js) → Télécharger Node.js

Docker & Docker Compose → Installer Docker

Git → Télécharger Git

⚙️ Étapes d'installation et de lancement

1️⃣ Cloner le dépôt

git clone git@github.com:weeckness/SneakR.git SneakR
cd SneakR

2️⃣ Configuration du Frontend (Vue.js)

# Se déplacer dans le dossier du frontend
cd sneqkr-front

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

📍 Le frontend sera accessible à http://localhost:5173.

3️⃣ Configuration du Backend et de la Base de Données

# Se déplacer dans le dossier du backend
cd ../Snearker.api

# Lancer le backend et la base de données avec Docker
docker-compose up -d

4️⃣ Accès à phpMyAdmin

📍 L'interface phpMyAdmin sera accessible à http://localhost:8080.

Identifiants par défaut :

Utilisateur: root

Mot de passe: thom

📝 Notes Importantes

✅ Avant de démarrer l'application, assurez-vous de configurer les fichiers .env dans le dossier frontend (vue-SneakR) avec les paramètres appropriés.✅ Le schéma de la base de données est automatiquement initialisé grâce à la configuration docker-compose.

🏫 Projet réalisé dans le cadre d'EPITECH Digital School

Ce projet est une démonstration de nos compétences en développement full-stack et en gestion de base de données dans un environnement cloud & conteneurisé.

🚀 Bon développement et n'hésitez pas à contribuer !