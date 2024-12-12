<template>
  <div class="search-bar">
    <div class="select-wrapper">
      <label for="brand">Brand</label>
      <select v-model="brand" id="brand">
        <option value="">All Brands</option>
        <option value="ASICS">Asics</option>
        <option value="Alexander Nc Queen">Alexander Mc Queen</option>
        <option value="Bape">Bape</option>
        <option value="Balanciaga">Balanciaga</option>
        <option value="Common Projects">Common Projects</option>
        <option value="Converse">Converse</option>
        <option value="Adidas">Adidas</option>
        <option value="Crocs">Crocs</option>
        <option value="Diadora">Diadora</option>
        <option value="Dior">Dior</option>
        <option value="Fila">Fila</option>
        <option value="Gucci">Gucci</option>
        <option value="Hoka One One">Hoka One One</option>
        <option value="Jordan">Jordan</option>
        <option value="Louis Vuitton">Louis Vuitton</option>
        <option value="New Balance">New Balance</option>
        <option value="Nike">Nike</option>
        <option value="Off-White">Off-White</option>
        <option value="On">On</option>
        <option value="Prada">Prada</option>
        <option value="Puma">Puma</option>
        <option value="Reebok">Reebok</option>
        <option value="Salomon">Salomon</option>
        <option value="Saucong">Saucong</option>
        <option value="Under Armor">Under Armor</option>
        <option value="Vans">Vans</option>
        <option value="Versace">Versace</option>
      </select>
    </div>

    <div class="select-wrapper">
      <label for="gender">Gender</label>
      <select v-model="gender" id="gender">
        <option value="">Tous les genres</option>
        <option value="men">Homme</option>
        <option value="women">Femme</option>
        <option value="unisex">Unisex</option>
      </select>
    </div>

    <button @click="search">Search</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const brand = ref('');
const gender = ref('');

const search = async () => {
  const params = new URLSearchParams();
  if (brand.value) params.append('brand', brand.value);
  if (gender.value) params.append('gender', gender.value);

  const response = await fetch(`http://localhost:3100/search?${params.toString()}`);
  if (response.ok) {
    const results = await response.json();
    emit('search-results', results);
  } else {
    console.error('Erreur lors de la recherche des produits.');
  }
};
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
  font-size: 14px;
}

select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-bar button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
}

.search-bar button:hover {
  background-color: #0056b3;
}
</style>