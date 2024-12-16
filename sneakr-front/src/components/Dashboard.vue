<template>
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>
                <select v-model="user.role" @change="updateUserRole(user)">
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button @click="deleteUser(user.id)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="users.length === 0">Aucun utilisateur trouvé.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "AdminDashboard",
    data() {
      return {
        users: [],
        loading: true,
      };
    },
    methods: {
      async fetchUsers() {
        this.loading = true;
        try {
          const token = localStorage.getItem("token");
          const response = await fetch('http://localhost:3100/admin/users', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des utilisateurs.');
          }
          this.users = await response.json();
        } catch (error) {
          console.error("Erreur lors de la récupération des utilisateurs:", error);
          alert("Erreur de chargement.");
        } finally {
          this.loading = false;
        }
      },
      async updateUserRole(user) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3100/admin/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ role: user.role })
          });
          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du rôle.');
          }
          alert(`Rôle mis à jour pour ${user.username}`);
        } catch (error) {
          console.error("Erreur lors de la mise à jour du rôle:", error);
          alert("Erreur de mise à jour.");
        }
      },
      async deleteUser(userId) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3100/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'utilisateur.');
          }
          this.users = this.users.filter(user => user.id !== userId);
          alert("Utilisateur supprimé avec succès.");
        } catch (error) {
          console.error("Erreur lors de la suppression de l'utilisateur:", error);
          alert("Erreur lors de la suppression de l'utilisateur.");
        }
      },
    },
    async mounted() {
      await this.fetchUsers();
    },
  };
  </script>
  
  <style scoped>
  .dashboard-container {
    width: 80%;
    margin: 0 auto;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    background-color: #f9f9f9;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  button {
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    background-color: #dc3545;
    color: white;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #c82333;
  }
  </style>