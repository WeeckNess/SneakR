<template>
  <div class="profile-container">
    <h1 class="title">Profile</h1>
    <div v-if="isLoggedIn">
      <div class="profile-header">
        <img :src="profileImage" alt="Profile Image" v-if="profileImage" class="profile-image" />
        <div class="profile-info">
          <h2>{{ username }}</h2>
          <button @click="logout" class="logout-button">Disconnect</button>
        </div>
      </div>
      <div class="profile-image-upload">
        <input type="file" @change="uploadProfileImage" />
      </div>
      <div class="collection">
        <h2>Your Collection</h2>
        <div v-if="collection.length > 0">
          <div v-for="(product, index) in collection" :key="index" class="collection-item">
            <img :src="product.imageOriginale || 'placeholder.jpg'" alt="Sneaker" class="product-image" />
            <div class="product-info">
              <h3>{{ product.name || "Nom indisponible" }}</h3>
              <p><strong>Prix : </strong>{{ product.marketValue || "N/A" }} €</p>
            </div>
            <button @click="removeFromCollection(product.id)" class="remove-button">Retirer</button>
          </div>
          <button @click="clearCollection" class="clear-button">Vider la collection</button>
          <button @click="showEmailModal" class="share-button">Partager par Email</button>
        </div>
        <div v-else>
          <p>Votre collection est vide.</p>
        </div>
      </div>
    </div>
    <div v-else>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-button">Login</button>
      </form>
    </div>

    <!-- Email Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEmailModal">&times;</span>
        <h2>Partager votre collection par Email</h2>
        <form @submit.prevent="sendEmail">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <button type="submit" class="send-button">Envoyer</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { jwtDecode } from 'jwt-decode';
import profilePlaceholder from '@/assets/coco.jpeg'; // Image locale

const isLoggedIn = ref(false);
const userId = ref(null);
const username = ref('');
const password = ref('');
const profileImage = ref(profilePlaceholder); // Default image
const collection = ref([]); // Collection of products
const showModal = ref(false);
const email = ref('');

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
  profileImage.value = profilePlaceholder;
  collection.value = [];
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

const sendEmail = async () => {
  try {
    const response = await fetch('http://localhost:3100/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, collection: collection.value })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de l\'email.');
    }

    alert('Email envoyé avec succès.');
    closeEmailModal();
  } catch (err) {
    console.error(err.message);
    alert('Erreur lors de l\'envoi de l\'email.');
  }
};

// Check token and load user data on mount
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

// Call checkToken on component mount
onMounted(checkToken);
</script>

<style scoped>
.profile-container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  background-color: #f9f9f9;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-info h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.profile-image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.collection {
  margin-top: 20px;
}

.collection h2 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.collection-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 5px;
  object-fit: cover;
  margin-right: 15px;
}

.product-info {
  flex-grow: 1;
}

.remove-button,
.clear-button,
.share-button {
  margin-top: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.remove-button:hover,
.clear-button:hover,
.share-button:hover {
  background-color: #0056b3;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  width: 300px;
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin-top: 0;
  font-size: 18px;
  color: #333;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 20px;
}

.send-button {
  margin-top: 10px;
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #218838;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-form .form-group {
  width: 100%;
  margin-bottom: 15px;
}

.login-form button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.login-form button:hover {
  background-color: #0056b3;
}
</style>