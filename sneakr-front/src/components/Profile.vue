<template>
<div class="profile-container">
  <h1 class="title">Connexion</h1>
  <div v-if="isLoggedIn">
    <div class="profile-info">
      <h2>Bonjour {{ username }}</h2>
    </div>

    <div class="profile-header">
      <img :src="profileImage" alt="Profile Image" v-if="profileImage" class="profile-image" />
    </div>

    <input type="file" @change="uploadProfileImage" />
    <div class="collection">
      <h2>Votre collection</h2>
    <button @click="logout" class="logout-button" v-if="true">Déconnexion</button>

      <div v-if="collection.length > 0">
        <div v-for="(product, index) in collection" :key="index" class="collection-item">
          <img :src="product.imageOriginale || 'placeholder.jpg'" alt="Sneaker" class="product-image" />
          <div class="product-info">
            <h3>{{ product.name || "Nom indisponible" }}</h3>
            <p><strong>Prix : </strong>{{ product.marketValue || "N/A" }} €</p>
          </div>

          <button @click="removeFromCollection(product.id)" class="remove-button">Retirer</button>
        </div>
        <div class="button-action">
          <button @click="clearCollection" class="clear-button">Vider la collection</button>
          <div class="email-container">
          <label for="emailRecipient.value">Adresse e-mail du destinataire :</label>
          <input type="email" id="emailRecipient.value" v-model="emailRecipient" placeholder="Entrez l'adresse e-mail du destinataire" required />
          <button @click="sendCollectionByEmail" class="send-email-button">Envoyer par E-mail</button>   

        </div>
        
        </div>
      </div>
      <div v-else>
        <p>Votre collection est vide.</p>
      </div>
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
      <button type="submit" class="login-button">Connexion</button>
    </form>
    <div v-if="showRegisterForm">
      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="register-username">Nom d'utilisateur</label>
          <input type="text" id="register-username" v-model="registerUsername" required />
        </div>
        <div class="form-group">
          <label for="register-password">Mot de passe</label>
          <input type="password" id="register-password" v-model="registerPassword" required />
        </div>
        <button type="submit" class="register-button">S'enregistrer</button>
      </form>
    </div>
    <p v-if="!showRegisterForm" @click="toggleRegisterForm" class="toggle-register">Si vous n'avez pas de compte, créez-en un</p>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { jwtDecode } from 'jwt-decode';
import profilePlaceholder from '@/assets/coco.jpeg'; // Image locale

const emailRecipient = ref('');
const isLoggedIn = ref(false);
const userId = ref(null);
const username = ref('');
const password = ref('');
const collection = ref([]); // Collection of products
const showModal = ref(false);
const email = ref('');
const registerUsername = ref('');
const registerPassword = ref('');
const showRegisterForm = ref(false);

const login = async () => {
  const response = await fetch('http://localhost:3100/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.value, password: password.value }),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    userId.value = data.userId;
    username.value = data.username;
    isLoggedIn.value = true;
    loadProfileImage(data.userId);
    loadCollection();
  } else {
    alert('Login failed. Please check your credentials.');
  }
};

const fetchCollection = async () => {
  try {
    const response = await axios.get(`http://localhost:3100/collections/${userId.value}`);
    collection.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection :', error.message);
    alert('Impossible de récupérer votre collection.');
  }
};

const sendCollectionByEmail = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Vous devez être connecté pour envoyer votre collection par e-mail.");
    return;
  }

  if (!emailRecipient.value) {
    alert("L'adresse e-mail du destinataire est requise.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3100/send-collection-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipientEmail: emailRecipient.value // Utilise l'adresse email saisie par l'utilisateur comme destinataire
      }),
    });

    if (response.ok) {
      alert('Votre collection a été envoyée par e-mail avec succès.');
      closeEmailModal();
    } else {
      const errorData = await response.json();
      console.error("Erreur lors de l'envoi de l'email :", errorData.message);
      alert(errorData.message);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la collection par e-mail :", error.message);
    alert("Impossible d'envoyer votre collection par e-mail.");
  }
};

const toggleRegisterForm = () => {
  showRegisterForm.value = !showRegisterForm.value;
  const contextMenu = document.getElementById('contextMenu');
  if (contextMenu) {
    contextMenu.style.display = showRegisterForm.value ? 'block' : 'none';
  }
};

const register = async () => {
  const response = await fetch('http://localhost:3100/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: registerUsername.value, password: registerPassword.value }),
  });
  if (response.ok) {
    alert('Registration successful. Please log in.');
  } else {
    alert('Registration failed. Please try again.');
  }
};

const loadProfileImage = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3100/profile-image/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    const data = await response.json();
    profileImage.value = data.imageUrl;
  } else {
    console.error('Erreur lors de la récupération de l\'image de profil.');
  }
};

const uploadProfileImage = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.error('No file selected');
    return;
  }
  const formData = new FormData();
  formData.append('profileImage', file);

  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3100/upload-profile-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (response.ok) {
    const data = await response.json();
    profileImage.value = data.imageUrl;
  } else {
    console.error('Erreur lors du téléchargement de l\'image de profil.');
  }
};

const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  username.value = '';
  userId.value = null;
  profileImage.value = profilePlaceholder;
  collection.value = [];
  alert("Vous êtes déconnecté.");
};

const loadCollection = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3100/collection', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    collection.value = await response.json();
  } else {
    console.error('Erreur lors de la récupération de la collection.');
  }
};

const removeFromCollection = async (productId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3100/collection/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    collection.value = collection.value.filter(product => product.id !== productId);
  } else {
    console.error('Erreur lors du retrait du produit de la collection.');
  }
};

const clearCollection = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3100/collection', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    collection.value = [];
  } else {
    console.error('Erreur lors du vidage de la collection.');
  }
};

const showEmailModal = () => {
  showModal.value = true;
};

const closeEmailModal = () => {
  showModal.value = false;
  email.value = '';
};

const checkToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = jwtDecode(token);
    userId.value = decoded.id;
    username.value = decoded.username;
    isLoggedIn.value = true;
    loadProfileImage(decoded.id);
    loadCollection();
  }
};

onMounted(checkToken);
</script>

<style scoped>
/* Polices globales */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
body {
  font-family: 'Poppins', sans-serif;
}

/* Container principal */
.profile-container {
  width: 90%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: linear-gradient(to bottom right, #fefefe, #f9f9f9);
  animation: fadeIn 0.5s ease-in-out;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Titre principal */
.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 600;
  color: #222;
  letter-spacing: 1px;
  position: relative;
}

/* Ligne décorative */
.title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: #007bff;
  margin: 10px auto;
  border-radius: 3px;
}

/* Section Profil */
.profile-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: center;
  justify-content: center;
}

.profile-image {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  align-self: center;
}

.profile-image:hover {
  transform: scale(1.05);
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  font-size: 34px;
  font-weight: 600;
  color: #444;
  position: relative;
  justify-self: center;
}

.logout-button {
  margin-top: 10px;
  background-color: #ff4d4d;
  color: white;
  transition: background-color 0.3s;
}
.remove-button {
position: relative;
align-self: left;
}

.logout-button:hover {
  background-color: #e63939;
}


/* Collection */
.collection h2 {
  font-size: 24px;
  color: #222;
  margin-bottom: 15px;
}
.h3 {
  font-size: 18px;
  color: #222;
  margin-bottom: 15px;
  justify-content: right;
  position: relative;
}

.collection-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  transition: box-shadow 0.3s;
  justify-content: space-between;
}

.email-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.email-container label {
  font-weight: 500;
  color: #333;
}

.email-container input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.send-email-button {
  background-color: #007bff;
  color: white;
  font-size: 14px;
}

.send-email-button:hover {
  background-color: #0056b3;
}

.collection-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.product-info h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  
}

.product-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

/* Boutons */
button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}

button:hover {
  transform: scale(1.05);
}

.clear-button {
  background-color: #ffc107;
}

.clear-button:hover {
  background-color: #e0a800;
}

.share-button {
  background-color: #28a745;
}

.share-button:hover {
  background-color: #218838;
}

.login-button, .register-button {
  background-color: #007bff;
  color: white;
}

.login-button:hover, .register-button:hover {
  background-color: #0056b3;
}

/* Formulaires */
.login-form, .register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 30px 0;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: #fefefe;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #000000;
}

h2 {
  font-size: 24px;
  color: #222;
  margin-bottom: 15px;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #eeeeee;
  color: #000000;
}

/* Modal */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 400px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease-in-out;
}

.close {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 20px;
  cursor: pointer;
}

.send-button {
  background-color: #007bff;
}

.send-button:hover {
  background-color: #0056b3;
}

.button-action{
  display: flex;
  justify-content: space-between;
  gap: 10px;

}

</style>