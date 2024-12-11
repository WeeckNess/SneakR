<template>
  <div class="profile-container">
    <h1 class="title">Mon Profil</h1>
    <div v-if="isLoggedIn">
      <div class="profile-header">
        <img
          :src="profileImage"
          alt="Image de profil"
          class="profile-image"
        />
        <div class="profile-info">
          <h2 class="username">{{ username }}</h2>
          <button @click="logout" class="logout-button">Se déconnecter</button>
        </div>
      </div>
      <div class="profile-image-upload">
        <label for="imageUpload" class="upload-label">
          Changer l'image de profil
        </label>
        <input
          type="file"
          id="imageUpload"
          @change="uploadProfileImage"
          class="file-input"
        />
      </div>
    </div>
    <div v-else>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-button">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { jwtDecode } from "jwt-decode";
import profilePlaceholder from "@/assets/coco.jpeg"; // Image locale

// Variables réactives
const isLoggedIn = ref(false);
const userId = ref(null);
const username = ref("");
const password = ref("");
const profileImage = ref(profilePlaceholder); // Image par défaut

// Fonction pour se connecter
const login = async () => {
  const response = await fetch("http://localhost:3100/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.value, password: password.value }),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("token", data.token);
    userId.value = data.userId;
    username.value = data.username;
    isLoggedIn.value = true;
  }
};

// Fonction pour envoyer une nouvelle image de profil
const uploadProfileImage = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.error("Aucun fichier sélectionné.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    profileImage.value = e.target.result; // Utilise la nouvelle image en base64
  };
  reader.readAsDataURL(file);
};

// Fonction pour se déconnecter
const logout = () => {
  localStorage.removeItem("token");
  isLoggedIn.value = false;
  username.value = "";
  profileImage.value = profilePlaceholder; // Réinitialise à l'image par défaut
};

// Vérifier le token lors du montage
const checkToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token);
    userId.value = decoded.id;
    username.value = decoded.username;
    isLoggedIn.value = true;
  }
};

onMounted(checkToken);
</script>

<style scoped>
/* Conteneur principal */
.profile-container {
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background: #fdfdfd;
  text-align: center;
}

/* Titre principal */
.title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

/* En-tête du profil */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Image de profil */
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #007bff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Informations utilisateur */
.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.username {
  font-size: 1.5rem;
  color: #007bff;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

/* Bouton de déconnexion */
.logout-button {
  padding: 0.5rem 1rem;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background: #c22736;
}

/* Formulaire de connexion */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.login-button {
  padding: 0.8rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background: #0056b3;
}

/* Upload d'image */
.profile-image-upload {
  margin-top: 1rem;
}

.upload-label {
  cursor: pointer;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  background: #007bff;
  color: white;
  display: inline-block;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.upload-label:hover {
  background: #0056b3;
}

.file-input {
  display: none;
}
</style>