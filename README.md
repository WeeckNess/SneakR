How to Launch the Project
Prerequisites
Ensure you have the following installed:
Node.js (for Vue.js development)
Docker & Docker Compose
Git

---

Steps to Launch
#### 1. Clone the Repository

git clone git@github.com:weeckness/SneakR.git SneakR


cd SneakR


#### 2. Setup the Frontend (Vue.js)

Navigate to the frontend directory:
cd sneqkr-front
Install dependencies:
npm install
Run the development server:
npm run dev

The frontend will be accessible at http://localhost:5173.

---

#### 3. Setup the Backend

Navigate to the backend (SneakR_DB) directory:
cd ../Snearker.api
Use Docker to set up the backend and database:
docker-compose up -d

---

#### 4. Access phpMyAdmin

phpMyAdmin will be accessible at:
http://localhost:8080
Use the following default credentials to log in:
Username: root
Password: thom

---

Notes:
Make sure to configure the .env files in frontend (vue-SneakR) directory with appropriate settings before starting.
The database schema will be automatically initialized via the docker-compose setup.

---

EPITECH Digital School Project