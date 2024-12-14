<template>
  <div class="search-bar">
    <div class="select-wrapper">
      <label for="brand">Marque</label>
      <select v-model="brand" id="brand">
        <option value="">All Brands</option>
        <option value="ASICS">Asics</option>
        <option value="Alexander Mc Queen">Alexander Mc Queen</option>
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
        <option value="Saucony">Saucony</option>
        <option value="Under Armour">Under Armour</option>
        <option value="Vans">Vans</option>
        <option value="Versace">Versace</option>
      </select>
    </div>

    <div class="select-wrapper">
      <label for="gender">Genre</label>
      <select v-model="gender" id="gender">
        <option value="">Tous les genres</option>
        <option value="men">Homme</option>
        <option value="women">Femme</option>
        <option value="unisex">Unisex</option>
      </select>
    </div>

    <div class="select-wrapper">
      <label for="character">Nom contient</label>
      <input type="text" id="character" v-model="character" placeholder="Rechercher par caractère..." />
    </div>

    <div class="select-wrapper">
      <label for="price-range">Prix</label>
      <div class="price-range">
        <input type="number" v-model="minMarketValue" placeholder="Min" />
        <input type="number" v-model="maxMarketValue" placeholder="Max" />
      </div>
    </div>

    <button @click="search">Rechercher</button>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['search-results']);

const brand = ref('');
const gender = ref('');
const character = ref('');
const minMarketValue = ref('');
const maxMarketValue = ref('');

const search = async () => {
  const params = new URLSearchParams();
  if (brand.value) params.append('brand', brand.value);
  if (gender.value) params.append('gender', gender.value);
  if (character.value) params.append('character', character.value);
  if (minMarketValue.value) params.append('minMarketValue', minMarketValue.value);
  if (maxMarketValue.value) params.append('maxMarketValue', maxMarketValue.value);

  try {
    const response = await fetch(`http://localhost:3100/search?${params.toString()}`);
    if (response.ok) {
      const results = await response.json();
      emit('search-results', results); // Émet les résultats pour être utilisés ailleurs
    } else {
      console.error('Erreur lors de la recherche des produits.');
    }
  } catch (error) {
    console.error('Erreur réseau :', error.message);
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

.price-range {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>