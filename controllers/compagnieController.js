import axios from "axios";
import multer from "multer";
import Compagnie from "../models/Compagnie.js";
import FormData from "form-data"; // Import nécessaire pour FormData côté serveur

// Configuration de Multer pour gérer les fichiers uploadés
const upload = multer({ storage: multer.memoryStorage() });

// Clé API ImgBB (remplacez par votre clé API ImgBB)
const imgbbAPIKey = "371ffd79ffd8cbe53799be1df6fc59f4";


// Ajouter une compagnie avec une image
const addCompagnie = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.file; // Image envoyée via la requête

    // Validation des données
    if (!name || !imageFile) {
      return res.status(400).json({ success: false, error: "Le champ 'name' et une image sont requis." });
    }

    console.log("Création d'une nouvelle Compagnie :", { name });

    // Convertir l'image en base64 pour l'envoyer à ImgBB
    const imageBase64 = imageFile.buffer.toString("base64");

    // Créer FormData pour ImgBB
    const formData = new FormData();
    formData.append("image", imageBase64);

    // Télécharger l'image sur ImgBB
    const imgbbResponse = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`,
      formData,
      { headers: formData.getHeaders() }
    );

    const imageUrl = imgbbResponse.data.data.url; // URL de l'image retournée par ImgBB

    // Créer une nouvelle compagnie avec l'URL de l'image
    const newComp = new Compagnie({
      name,
      image: imageUrl,
    });

    await newComp.save();

    console.log("Compagnie créée :", newComp);

    return res.status(201).json({ success: true, compagnie: newComp });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une compagnie :", error);
    return res.status(500).json({ success: false, error: "Erreur du serveur lors de l'ajout d'une compagnie." });
  }
};

// Récupérer toutes les compagnies
const getCompagnies = async (req, res) => {
  try {
    const Compagnies = await Compagnie.find();
    return res.status(200).json({ success: true, Compagnies });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erreur du serveur lors de la récupération des compagnies.",
    });
  }
};

// Récupérer une seule compagnie par ID
const getCompagnie = async (req, res) => {
  try {
    const { id } = req.params;
    const compagnie = await Compagnie.findById({ _id: id });

    if (!compagnie) {
      return res.status(404).json({ success: false, error: "Compagnie non trouvée." });
    }

    return res.status(200).json({ success: true, compagnie });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erreur du serveur lors de la récupération de la compagnie.",
    });
  }
};


// Supprimer une compagnie par ID
const deleteCompagnie = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Vérifier si la compagnie existe
      const compagnie = await Compagnie.findById(id);
      if (!compagnie) {
        return res.status(404).json({ success: false, error: "Compagnie non trouvée." });
      }
  
      // Supprimer la compagnie
      await Compagnie.findByIdAndDelete(id);
  
      return res.status(200).json({ success: true, message: "Compagnie supprimée avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression de la compagnie :", error);
      return res.status(500).json({ success: false, error: "Erreur du serveur lors de la suppression de la compagnie." });
    }
  };
  
  // Modifier une compagnie
  const editCompagnie = async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const imageFile = req.file;
  
      // Vérifier si la compagnie existe
      const compagnie = await Compagnie.findById(id);
      if (!compagnie) {
        return res.status(404).json({ success: false, error: "Compagnie non trouvée." });
      }
  
      // Si un nouveau nom est fourni, le mettre à jour
      if (name) {
        compagnie.name = name;
      }
  
      // Si une nouvelle image est fournie, la télécharger sur ImgBB
      if (imageFile) {
        const imageBase64 = imageFile.buffer.toString("base64");
  
        const formData = new FormData();
        formData.append("image", imageBase64);
  
        const imgbbResponse = await axios.post(
          `https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`,
          formData,
          { headers: formData.getHeaders() }
        );
  
        const imageUrl = imgbbResponse.data.data.url;
        compagnie.image = imageUrl; // Mettre à jour l'URL de l'image
      }
  
      // Sauvegarder les modifications
      await compagnie.save();
  
      return res.status(200).json({ success: true, compagnie });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la compagnie :", error);
      return res.status(500).json({ success: false, error: "Erreur du serveur lors de la mise à jour de la compagnie." });
    }
  };
  
  export { addCompagnie, getCompagnies, getCompagnie, deleteCompagnie, editCompagnie, upload };
  
