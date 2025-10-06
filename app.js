//  on importe le module express
import express from 'express';
import activitiesRouter from "./routes/activities.mjs";


// on crée une application Express
const app = express();

// on définit le port
const port = process.env.PORT || 3000;

app.use(express.json());

// On crée une route GET sur la racine
// Quand un utilisateur ouvre http://localhost:3000/ dans son navigateur,
// cette fonction est appelée et envoie "Hello World!" en réponse
app.get('/', (req, res) => {
 res.redirect('/api/activities')
})

app.use('/api/activities', activitiesRouter);


app.use(({ res }) => {
    const message =
        "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
    res.status(404).json(message);
});

// on démarre le serveur et on lui demande de se connecter au port défini
// une fois lancé, le message est afficher dans la console
app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
    console.log('You can open this URL in your browser to see "Hello World!".');
});
 