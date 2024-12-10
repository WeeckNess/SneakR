<template>
  <div class="login-container">
    <h1 class="title">{{ isLoggedIn ? 'Profil' : 'Connexion' }}</h1>

    <!-- Formulaire de connexion ou de mise à jour de profil -->
    <form @submit.prevent="isLoggedIn ? updateProfile() : login()" class="login-form">
      <div v-if="!isLoggedIn">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" v-model="username" id="username" class="form-control" required />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" v-model="password" id="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary">Se Connecter</button>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <div v-if="isLoggedIn">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" v-model="username" id="username" class="form-control" />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" v-model="password" id="password" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary">Mettre à jour</button>
        <p v-if="profileError" class="error">{{ profileError }}</p>
      </div>
    </form>

    <h2 v-if="isLoggedIn" class="wishlist-title">Wishlist</h2>
    <div v-if="isLoggedIn && loading" class="loading">Chargement...</div>
    <ul v-if="isLoggedIn && wishlist.length > 0">
      <li v-for="item in wishlist" :key="item.id" class="wishlist-item">
        <img :src="item.imageOriginale || ''" alt="Sneaker" class="wishlist-image" />
        <div class="wishlist-details">
          <p>{{ item.name }} - {{ item.marketValue }} €</p>
        </div>
      </li>
    </ul>
    <p v-else-if="isLoggedIn">Aucune wishlist disponible.</p>
  </div>
</template>

&<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const wishlist = ref([]);
    const loading = ref(true);
    const error = ref('');
    const profileError = ref('');
    const isLoggedIn = ref(false);

    const loadProfile = async () => {
      try {
        const userResponse = await fetch('http://localhost:3100/api/login', { // Mis à jour pour correspondre à l'URL correcte
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!userResponse.ok) throw new Error('Erreur lors du chargement des données utilisateur.');

        const userData = await userResponse.json();
        if (userData) {
          isLoggedIn.value = true;
          username.value = userData.username;

          const wishlistResponse = await fetch(`http://localhost:3100/api/wishlist/${userData.userId}`, { // Mis à jour pour correspondre à l'URL correcte
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!wishlistResponse.ok) throw new Error('Erreur lors du chargement de la wishlist.');

          const wishlistData = await wishlistResponse.json();
          wishlist.value = wishlistData;
        }
      } catch (err) {
        error.value = 'Impossible de charger les données.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const login = async () => {
      try {
        const response = await fetch('http://localhost:3100/login', { // Mis à jour pour correspondre à l'URL correcte
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, password: password.value }),
        });

        if (!response.ok) throw new Error('Erreur de connexion.');

        const userData = await response.json();
        if (userData) {
          isLoggedIn.value = true;
          username.value = userData.username;
        }
      } catch (err) {
        error.value = 'Nom d\'utilisateur ou mot de passe incorrect.';
        console.error(err);
      }
    };

    const updateProfile = async () => {
      try {
        const response = await fetch('http://localhost:3100/api/update-profile', { // Mis à jour pour correspondre à l'URL correcte
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, password: password.value }),
        });

        if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil.');

        const updatedData = await response.json();
        console.log('Profil mis à jour :', updatedData);
      } catch (err) {
        profileError.value = 'Impossible de mettre à jour le profil.';
        console.error(err);
      }
    };

    onMounted(() => {
      loadProfile();
    });

    return {
      username,
      password,
      wishlist,
      loading,
      error,
      profileError,
      isLoggedIn,
      login,
      updateProfile,
    };
  },
};
</script>

<style scoped>
.login-container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
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
  font-weight: bold;
  margin-bottom: 5px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
}

.btn {
  width: 100px;
  align-self: center;
  padding: 5px;
  border: none;
  color: white;
  background-color: #007bff;
  border-radius: 3px;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.wishlist-title {
  text-align: center;
  margin-top: 20px;
  font-size: 20px;
  color: #333;
}

.loading {
  text-align: center;
  margin-top: 20px;
}

.wishlist-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.wishlist-image {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.wishlist-details {
  flex: 1;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>