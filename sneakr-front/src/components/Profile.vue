<template>
    <div class="login-container">
      <h1>Connexion</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="role">Rôle</label>
          <select v-model="form.role" id="role" required>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            type="password"
            v-model="form.password"
            id="password"
            placeholder="Entrez votre mot de passe"
            required
          />
        </div>
        <button type="submit">Se connecter</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        form: {
          role: "user", // Rôle par défaut
          password: "",
        },
        error: null,
      };
    },
    methods: {
      async login() {
        this.error = null;
        try {
          const response = await fetch("http://localhost:3001/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur de connexion.");
          }
  
          const data = await response.json();
          alert(data.message); // Message du serveur
          this.$router.push("/home"); // Redirection vers la page home
        } catch (err) {
          this.error = err.message;
        }
      },
    },
  };
  </script>
  
  <style>
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  h1 {
    text-align: center;
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
  }
  input,
  select {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  .error {
    color: red;
    text-align: center;
    margin-top: 10px;
  }
  </style>