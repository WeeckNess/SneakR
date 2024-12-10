const axios = require('axios');
const fs = require('fs');

const apiUrl = 'http://54.37.12.181:1337/api/sneakers';

// Fonction pour récupérer et exporter toutes les pages en CSV
async function fetchAndExportToCSV() {
    let allSneakers = []; // Contient toutes les données
    let currentPage = 1; // Page initiale
    const pageSize = 100; // Taille des pages (nombre d'éléments par page)
    let hasMoreData = true; // Indique si on doit continuer à scraper

    try {
        while (hasMoreData) {
            const paginatedUrl = `${apiUrl}?pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;
            console.log(`Scraping page ${currentPage}...`);

            const response = await axios.get(paginatedUrl);

            if (response.status === 200) {
                const sneakers = response.data.data;

                // Ajouter les données de la page actuelle à allSneakers
                allSneakers = allSneakers.concat(sneakers);

                // Si on a récupéré moins que le nombre d'éléments d'une page complète, on a atteint la fin
                if (sneakers.length < pageSize) {
                    hasMoreData = false;
                } else {
                    currentPage++; // Passer à la page suivante
                }
            } else {
                console.error(`Erreur lors de la récupération des données : ${response.status}`);
                hasMoreData = false;
            }
        }

        // Générer le fichier CSV
        let csvContent = 'name,brand,colorway,marketValue,gender,imageOriginal,imageThumbnail,releaseDate\n';

        allSneakers.forEach((sneaker) => {
            const attributes = sneaker.attributes;

            const name = attributes.name?.replace(/"/g, '""') || '';
            const brand = attributes.brand?.replace(/"/g, '""') || '';
            const colorway = attributes.colorway?.replace(/"/g, '""') || '';
            const marketValue = attributes.estimatedMarketValue || '';
            const gender = attributes.gender || '';
            const imageOriginal = attributes.image?.original || '';
            const imageThumbnail = attributes.image?.thumbnail || '';
            const releaseDate = attributes.releaseDate || '';

            // Ajouter une ligne dans le fichier CSV
            csvContent += `"${name}","${brand}","${colorway}",${marketValue},"${gender}","${imageOriginal}","${imageThumbnail}","${releaseDate}"\n`;
        });

        // Enregistrer le fichier CSV
        const fileName = 'sneakers_data_all_pages.csv';
        fs.writeFileSync(fileName, csvContent);

        console.log(`Les données de toutes les pages ont été exportées avec succès dans le fichier : ${fileName}`);
    } catch (error) {
        console.error('Erreur lors de la récupération ou de l\'exportation des données :', error.message);
    }
}

// Exécuter la fonction
fetchAndExportToCSV();