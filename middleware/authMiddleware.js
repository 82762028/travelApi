import  jwt from "jsonwebtoken";
import User from "../models/User.js";
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extrait correctement le token
    if (!token) {
      console.error("Token not provided");
      return res.status(401).json({ success: false, error: "Accès non autorisé : Token manquant." });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log("Token decoded:", decoded);

    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ success: false, error: "Utilisateur introuvable." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur d'authentification :", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expiré." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Token invalide." });
    } else {
      return res.status(500).json({ success: false, error: "Erreur serveur." });
    }
  }
};

  

export default verifyUser;
