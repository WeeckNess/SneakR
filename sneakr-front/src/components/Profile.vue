<template>
  <div class="profile-container">
    <h1 class="title">Profile</h1>
    <div v-if="isLoggedIn">
      <button @click="logout" class="logout-button">Disconnect</button>
      <div class="profile-image-container">
        <img :src="profileImage" alt="Profile Image" v-if="profileImage" class="profile-image" />
        <input type="file" @change="uploadProfileImage" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { jwtDecode } from 'jwt-decode';

// Reactive variables
const isLoggedIn = ref(false);
const userId = ref(null);
const username = ref('');
const password = ref('');
const profileImage = ref('');

// Function to handle login
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
    isLoggedIn.value = true;
    loadProfileImage(data.userId);
  }
};

// Function to load profile image
const loadProfileImage = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3100/profile-image/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    const data = await response.json();
    profileImage.value = data.imageUrl;
  }
};

// Function to upload profile image
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
  }
};

// Function to handle logout
const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  username.value = '';
  profileImage.value = '';
};

// Function to check token and load user data on mount
const checkToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = jwtDecode(token);
    userId.value = decoded.id;
    isLoggedIn.value = true;
    loadProfileImage(decoded.id);
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

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.login-button,
.logout-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  margin-top: 10px;
}

.login-button:hover,
.logout-button:hover {
  background-color: #0056b3;
}

.profile-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}
</style>