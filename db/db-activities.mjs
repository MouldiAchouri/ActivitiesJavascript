import mysql from 'mysql2/promise';

const db = {
    connectToDatabase: async () => {
        // Utilisation de mysql.createConnection est correcte pour les connexions à usage unique
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'app_activities',
        });
        return con;
    },

    disconnectFromDatabase: async (con) => {
        try {
            await con.end();
            // Retirer le console.log ici est souvent préférable en production
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            // On peut choisir de ne pas 'throw' ici pour que l'opération principale ne soit pas impactée
        }
    },

    getAllActivities: async () => {
        let con;
        try {
            con = await db.connectToDatabase();
            const [rows] = await con.query('SELECT * FROM activities');
            return rows;
        } catch (error) {
            console.error(error); // Utiliser console.error
            throw error;
        } finally {
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    getActivitiesById: async (id) => {
        let con;
        try {
            con = await db.connectToDatabase();
            const [rows] = await con.query('SELECT * FROM activities WHERE id = ?', [id]);
            // Retourne le premier résultat ou undefined si le tableau est vide
            return rows[0];
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    createActivities: async ({nom, dateDebut, duree}) => { // CORRECTION: Utiliser 'duree' (sans accent) pour la cohérence
        let con;
        try {
            con = await db.connectToDatabase();
            const [result] = await con.query(
                'INSERT INTO activities (nom, dateDebut, duree) VALUES (?, ?, ?)',
                [nom, dateDebut, duree] // CORRECTION: Utiliser 'duree'
            );
            // Retourne l'objet d'activité créé
            return {id: result.insertId, nom, dateDebut, duree};
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    updateActivities: async (id, {nom, dateDebut, duree}) => { // CORRECTION: Utiliser 'duree' et l'ID dans la signature
        let con;
        try {
            con = await db.connectToDatabase();
            const [result] = await con.query(
                // CORRECTION MAJEURE: Mettre l'ID dans la clause WHERE et 'duree' dans le SET
                `UPDATE activities
                 SET nom = ?,
                     dateDebut = ?,
                     duree = ?
                 WHERE id = ?`,
                [nom, dateDebut, duree, id]
            );
            // Retourne le nombre de lignes affectées (0 ou 1)
            return result.affectedRows;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    deleteActivities: async (id) => {
        let con;
        try {
            con = await db.connectToDatabase();
            const [result] = await con.query('DELETE FROM activities WHERE id = ?', [id]);

            if (result.affectedRows > 0) {
                // Retourne {success: true} pour être utilisé par le routeur
                return {success: true};
            } else {
                // Retourne {success: false} si aucune ligne n'a été trouvée/supprimée
                return {success: false, message: 'Activité non trouvée.'};
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            if (con) await db.disconnectFromDatabase(con);
        }
    },
    // ajout d'une fonction pour gérer la recherche par le nom
    searchActivitiesByName: async (name) => {
        let con;
        try {
            con = await db.connectToDatabase();

            //    Ceci permet de trouver la chaîne 'name' n'importe où dans le champ 'nom'.
            const searchPattern = `%${name}%`;

            // 2. Utilisation de LIKE avec le motif et des requêtes préparées (le '?' dans la clause WHERE)
            const [rows] = await con.query(
                'SELECT * FROM activities WHERE nom LIKE ?',
                [searchPattern]
            );

            return rows;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            if (con) await db.disconnectFromDatabase(con);
        }
    }
}

export { db }