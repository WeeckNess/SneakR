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
      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="register-username">Username</label>
          <input type="text" id="register-username" v-model="registerUsername" required />
        </div>
        <div class="form-group">
          <label for="register-password">Password</label>
          <input type="password" id="register-password" v-model="registerPassword" required />
        </div>
        <button type="submit" class="register-button">Register</button>
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
const registerUsername = ref('');
const registerPassword = ref('');

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
    const response = await fetch('http://localhost:3100/send-collection', {
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
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 15px;
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

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #0056b3;
}

.logout-button {
  background-color: #dc3545;
}

.logout-button:hover {
  background-color: #c82333;
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

.login-form, .register-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.login-button, .register-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.login-button:hover, .register-button:hover {
  background-color: #0056b3;
}

/* Modal styles */
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
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.send-button {
  background-color: #007bff;
}

.send-button:hover {
  background-color: #0056b3;
}
</style>