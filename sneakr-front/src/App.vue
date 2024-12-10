<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="gauche">
        <RouterLink to="/search" class="nav-link">
          <img src="../src/assets/Search logo.png" alt="Logo" class="search-logo" />
        </RouterLink>
      </nav>
      <nav class="logo">
        <RouterLink to="/">
          <img src="../src/assets/SNK Trade Logo.webp" alt="Logo" class="logo-img" />
        </RouterLink>
      </nav>
      <nav class="droite">
        <RouterLink to="/profile" class="nav-link">
          <img src="../src/assets/User Profile Logo.png" alt="Profile" class="profile-icon" />
        </RouterLink>
        <RouterLink to="/cart" class="nav-link">
          <img src="../src/assets/Wishlist.png" alt="Cart" class="cart-icon" />
        </RouterLink>
      </nav>
    </div>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.wrapper {
  background-color: white;
  padding: 1rem 2rem;
  font-family: 'Bebas Neue', sans-serif;
  display: flex;
  justify-content: space-between; 
  align-items: center;
  width: 100%; 
  padding-left: 1rem;
}

.gauche {
  display: flex;
  justify-content: flex-start;
}

.droite {
  display: flex;
  justify-content: flex-end;
}

.logo {
  flex: 1;
  text-align: center;
}

.logo-img {
  max-height: 120px;
  object-fit: contain;  
  transition: transform 0.3s ease, filter 0.3s ease; 
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

.droite .nav-link {
  margin-right: 20px;
}

.profile-icon,
.cart-icon {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 0%;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.cart-icon:hover,
.profile-icon:hover {
  transform: scale(1.1);
  filter: invert(1);
}

.search-icon:hover {
  transform: scale(0.1);
  filter: invert(1);
}

.search-logo {
  width: 75px;
  height: 90px;
  object-fit: cover;
  border-radius: 0%;
  transition: transform 0.3s ease, filter 0.3s ease;
}
 
main {
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 80vh;
}
</style>