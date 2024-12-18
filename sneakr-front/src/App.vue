<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

const isAdmin = ref(false);

const checkAdminRole = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    isAdmin.value = payload.role === 'admin';
  }
};

onMounted(() => {
  checkAdminRole();
});
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="logo">
        <RouterLink to="/">
          <img src="../src/assets/SNK Trade Logo.webp" alt="Logo" class="logo-img" />
        </RouterLink>
      </nav>
      <nav class="droite">
        <RouterLink to="/profile" class="nav-link">
          <img src="../src/assets/User Profile Logo.png" alt="Profile" class="profile-icon" />
        </RouterLink>
        <RouterLink to="/Wishlist" class="nav-link">
          <img src="../src/assets/Wishlist.png" alt="Wishlist" class="wishlist-icon" />
        </RouterLink>
        <RouterLink v-if= 'isAdmin' to="/dashboard" class="nav-link">
          Dashboard
        </RouterLink>
      </nav>
    </div>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style>
 body {
  margin: 0;
 }
.header {
  width: 100%;
}

.wrapper {
  background-color: white;
  padding: 1rem;
  font-family: 'Bebas Neue', sans-serif;
  display: flex;
  justify-content: space-between; 
  align-items: center;
  padding-left: 1rem;
}

.droite {
  display: flex;
  justify-content: space-between;
}

.logo {
  flex: 1;
  text-align: left;
}

.logo-img {
  max-height: 120px;
  object-fit: contain;  
  transition: transform 0.3s ease, filter 0.3s ease; 
  justify-content: left;
  /* background-color: rgb(255, 255, 255); */
}

.logo-img:hover {
  transform: scale(1.1);
  filter: invert(1);
}

.nav-link {
  color: #353535;
  text-decoration: none;
  font-size: 18px;
  padding: 10px 20px;
  border-radius: 4px;
  transition: all 0.3s ease;
}


.nav-link:hover {
  background-color: #353535;
  color: #fff;
  transform: scale(1.1);
}

.nav-link:active {
  background-color: #ffffff;
}

.nav-logo {
  display: flex;
  justify-content: left;
}

.profile-icon,
.wishlist-icon {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 0%;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.wishlist-icon:hover,
.profile-icon:hover {
  transform: scale(1.1);
  filter: invert(1);
}

html {
color: black} 

main {
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 80vh;
}
</style>