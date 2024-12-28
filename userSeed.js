import User from './models/User.js'; // Assurez-vous que le chemin est correct
import bcrypt from 'bcrypt';
import connectToDatabase from './db/db.js'; // Importez la fonction de connexion

const userRegister = async () => {
    try {
        // Connectez-vous à la base de données
        await connectToDatabase();
        console.log("Connexion à la base de données réussie");

        // Cryptage du mot de passe
        const hashPassword = await bcrypt.hash("admin", 10);

        const newUser = new User({
            name: "Admin",
            telephone:"82762028",
            email: "amaganasagara82762028@gmail.com",
            password: hashPassword,
            role: "admin",
        });

        await newUser.save();
        console.log("Utilisateur créé avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    } 
};

userRegister();
