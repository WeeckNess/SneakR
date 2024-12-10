<template>
    <div>
      <h1>Liste des Produits</h1>
      <ul>
        <li v-for="product in products" :key="product.id">
          {{ product.name }} - {{ product.price }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        products: []
      };
    },
    created() {
      this.fetchProducts();
    },
    methods: {
      async fetchProducts() {
        try {
          const response = await fetch('http://localhost:3100/sneakers', { // Utilisation du port ajusté
            method: 'GET',
            headers: {
              'Content-Type': 'application/json' // Ajout de l'en-tête Content-Type
            }
          });
          if (!response.ok) throw new Error('Erreur lors du fetch');
          const data = await response.json();
          this.products = data;
        } catch (error) {
          console.error('Erreur :', error.message); // Affichage du message d'erreur
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Styles ici */
  </style>