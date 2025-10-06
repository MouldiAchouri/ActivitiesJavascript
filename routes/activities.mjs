import express from "express";
// Remplacez par le nom correct de votre fichier de connexion BDD
import { db } from "../db/db-activities.mjs";
// Note : Vous devrez créer un fichier 'helper.mjs' pour isValidId
// ou l'implémenter directement.
// import { isValidId } from "../helper.mjs";

const activitiesRouter = express.Router();

// Affichez l’ensemble des activités OU les activités filtrées par nom
activitiesRouter.get("/", async (req, res) => {
    try {
        const nameFilter = req.query.name;

        let activities;

        if (nameFilter) {
            // ✅ C'EST LA CORRECTION CRUCIALE
            if (nameFilter.length < 3) {
                return res.status(400).json({ error: "La chaîne de caractères recherchée doit contenir au moins 3 caractères." });
            }

            // Si la longueur est bonne
            activities = await db.searchActivitiesByName(nameFilter);
        } else {
            // Si aucun paramètre n'est présent
            activities = await db.getAllActivities();
        }

        res.json({ activities });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la récupération des activités." });
    }
});

// Affichez une activité donnée
activitiesRouter.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Vérification de l'ID
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        // La fonction getActivitiesById retourne directement l'objet d'activité unique (ou undefined/null)
        const activity = await db.getActivitiesById(id);

        if (!activity) { // Vérifie si l'activité n'a pas été trouvée (undefined)
            return res.status(404).json({ error: "Activité non trouvée." });
        }

        res.json({ activity });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la récupération de l'activité." });
    }
});

// Ajoutez une nouvelle activité
activitiesRouter.post("/", async (req, res) => {
    try {
        const { nom, dateDebut, durée } = req.body;

        // Validation simple des données reçues
        if (!nom || !dateDebut || !durée) {
            return res.status(400).json({ error: "Les champs 'nom', 'dateDebut' et 'durée' sont requis." });
        }

        // Appel de la fonction createActivities avec les bonnes propriétés
        const newActivity = await db.createActivities({ nom, dateDebut, durée });

        const message = `L'événement ${newActivity.nom} a bien été créé !`;

        // Statut 201 Created pour une nouvelle ressource
        res.status(201).json({ message: message, activity: newActivity });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la création de l'activité." });
    }
});

// Mettez à jour une activité donnée
activitiesRouter.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nom, dateDebut, durée } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        // Validation simple des données reçues pour la mise à jour
        if (!nom || !dateDebut || !durée) {
            return res.status(400).json({ error: "Les champs 'nom', 'dateDebut' et 'durée' sont requis pour la mise à jour." });
        }

        // La fonction updateActivities retourne le nombre de lignes affectées (0 ou 1)
        const affectedRows = await db.updateActivities(id, { nom, dateDebut, durée });

        if (affectedRows === 0) {
            return res.status(404).json({ error: "Activité non trouvée pour la mise à jour." });
        }

        // On récupère l'objet mis à jour pour le renvoyer
        const activityUpdated = await db.getActivitiesById(id);

        res.json({ message: 'Activité mise à jour', activity: activityUpdated });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'activité." });
    }
});

// Supprimez une activité donnée
activitiesRouter.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        // deleteActivities renvoie {success: true} ou {success: false}
        const result = await db.deleteActivities(id);

        if (result.success) {
            res.json({ message: 'Activité supprimée' });
        } else {
            // Si affectedRows était 0, on renvoie 404
            res.status(404).json({ error: "Activité non trouvée pour la suppression." });
        }
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la suppression de l'activité." });
    }
});

export default activitiesRouter;