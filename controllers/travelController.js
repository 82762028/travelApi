import Trajet from "../models/Trajet.js"
import bcrypt from "bcrypt"
import Departement from "../models/Departement.js"
import User from "../models/User.js"
import Travel from "../models/Travel.js"
import mongoose from "mongoose"
import { io } from "../index.js";


 const addTravel = async (req, res) => {
  try {
    const {
      date,
      places,
      travelId,
      name,
      nombre,
      priceTotal,
      time,
      userId,
      trajetId,
    } = req.body;

    // Valider les champs obligatoires
    if (!date || !time || !travelId || !name || !nombre || !userId || !trajetId) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires.' });
    }

    // Récupérer la durée du trajet associé
    const trajet = await Trajet.findById(trajetId);
    if (!trajet) {
      return res.status(404).json({ message: 'Trajet introuvable.' });
    }
    
    const duree = trajet.duree; // Durée du trajet en format HH:mm
    
     

    // Calculer l'heure d'arrivée en additionnant `time` et `duree`
    const calculateArrivalTime = (startTime, duration) => {
      const [startHours, startMinutes] = startTime.split(':').map(Number); // Départ: HH:mm
      const [durationHours, durationMinutes] = duration.split(':').map(Number); // Durée: HH:mm

      // Calcul mathématique
      const totalMinutes = startMinutes + durationMinutes;
      const extraHours = Math.floor(totalMinutes / 60); // Minutes additionnelles
      const arrivalMinutes = totalMinutes % 60;

      const totalHours = startHours + durationHours + extraHours;
      const arrivalHours = totalHours % 24; // Limiter à 24 heures

      // Retourner le temps formaté
      return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
    };

    const arrived = calculateArrivalTime(time, duree); 
    
// Calcul de l’heure d’arrivée

    // Créer une nouvelle instance de Travel
    const newTravel = new Travel({
      date,
      places,
      travelId,
      name,
      nombre,
      priceTotal,
      time,
      arrived, // Horaire calculée
      userId,
      trajetId,
    });

    // Sauvegarder dans la base de données
    await newTravel.save();
    io.emit("travel_added", newTravel);

    res.status(201).json({
      success: true,
      message: 'Voyage ajouté avec succès.',
      travel: newTravel,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du voyage :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};




const addPlaceToTravel = async (req, res) => {
  try {
    const { id } = req.params;
    const { place } = req.body;

    // Trouver le voyage par ID
    const travel = await Travel.findById(id);
    if (!travel) {
      return res.status(404).json({ success: false, message: "Voyage non trouvé." });
    }

    // Vérifier si la place est déjà réservée
    const isPlaceTaken = travel.places.some((p) => p.place == place);
    if (isPlaceTaken) {
      return res
        .status(400)
        .json({ success: false, message: "Ce numéro de place est déjà réservé pour ce voyage." });
    }

    // Vérifier si le voyage est complet
    if (travel.places.length >= travel.nombre) {
      return res
        .status(400)
        .json({ success: false, message: "Aucune autre place ne peut être ajoutée. Le voyage est complet." });
    }

    // Ajouter la nouvelle place
    travel.places.push({ place });

    // Marquer le voyage comme "complet" si toutes les places sont réservées
    if (travel.places.length === travel.nombre) {
      travel.valide = true;
    }

    // Sauvegarder les modifications
    await travel.save();
    io.emit("place_added", travel);

    return res.status(200).json({
      success: true,
      message: "Place ajoutée avec succès.",
      travel,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'ajout de la place.",
    });
  }
};


const validateTravel = async (req, res) => {
  try {
    const { id } = req.params;

    // Rechercher le voyage par ID
    const travel = await Travel.findById(id);
    if (!travel) {
      return res.status(404).json({ success: false, message: "Travel non trouvé." });
    }

    // Envoyer le statut valide
    return res.status(200).json({ success: true, valide: travel.valide });
  } catch (error) {
    console.error("Erreur lors de la récupération du statut valide :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const getTerminatedStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Rechercher le voyage par ID
    const travel = await Travel.findById(id);
    if (!travel) {
      return res.status(404).json({ success: false, message: "Travel non trouvé." });
    }

    // Envoyer le statut `terminated`
    return res.status(200).json({ success: true, terminated: travel.terminated });
  } catch (error) {
    console.error("Erreur lors de la récupération du statut terminated :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};
const updateTerminatedStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Rechercher le voyage par ID
    const travel = await Travel.findById(id);
    console.log("ivii")
    if (!travel) {
      return res.status(404).json({ success: false, message: "Travel non trouvé." });
    }

    // Vérifier si le statut est déjà `true`
    if (travel.terminated) {
      return res.status(400).json({ success: false, message: "Travel est déjà terminé." });
    }

    // Mettre à jour le statut terminated en `true`
    travel.terminated = true;
    await travel.save();
    io.emit("travel_end", travel);

    return res.status(200).json({ success: true, message: "Statut terminé mis à jour avec succès.", travel });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut terminated :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};


const getTravels = async (req, res) => {
  try {
    const travels = await Travel.find()
      .populate("userId", "name email") // Remplit les informations de l'utilisateur
      .populate({
        path: "trajetId", // Remplit les informations du trajet
        populate: [
          { path: "departure", select: "name ville" }, // Inclut le nom et la ville de départ
          { path: "destination", select: "name ville" } // Inclut le nom et la ville de destination
        ]
      });

    res.status(200).json({ success: true, travels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des travels." });
  }
};

const getTravel = async (req, res) => {
  try {
    const { id } = req.params;

    const travel = await Travel.findById(id)
      .populate("userId", "name email") // Remplit les informations de l'utilisateur
      .populate({
        path: "trajetId", // Remplit les informations du trajet
        populate: [
          { path: "departure", select: "name ville" }, // Inclut le nom et la ville de départ
          { path: "destination", select: "name ville" } // Inclut le nom et la ville de destination
        ]
      });

    if (!travel) {
      return res.status(404).json({ success: false, message: "Travel non trouvé." });
    }

    res.status(200).json({ success: true, travel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération du travel." });
  }
};

const updateTravel = async (req, res) => {
  try {
    const { id } = req.params; // ID du Travel à mettre à jour
    const updates = req.body; // Données provenant du formulaire

    // Rechercher le Travel par ID
    const travel = await Travel.findById(id);
    if (!travel) {
      return res.status(404).json({ success: false, message: "Travel non trouvé." });
    }

    // Mise à jour des champs généraux
    if (updates.date) travel.date = updates.date;
    if (updates.name) travel.name = updates.name;
    if (updates.time) travel.time = updates.time;
    if (updates.nombre) travel.nombre = updates.nombre;
    if (updates.trajetId) travel.trajetId = updates.trajetId; // Ajout pour trajetId

    // Mettre à jour le champ `updateAt`
    travel.updateAt = Date.now();

    // Sauvegarder les modifications
    const updatedTravel = await travel.save();

    return res.status(200).json({
      success: true,
      message: "Travel mis à jour avec succès.",
      travel: updatedTravel,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour du travel." });
  }
};


const deleteTravel = async (req, res) => {
  try {
    const { id } = req.params;

    const travel = await Travel.findByIdAndDelete(id); // Supprime directement
    if (!travel) {
      return res.status(404).json({ success: false, message: "Travel non trouvé." });
    }

    return res.status(200).json({ success: true, message: "Travel supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression du travel." });
  }
};
 //   
 const getTravelsByUserCity = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur depuis les paramètres de la requête
    const userId = req.user._id;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Trouver les voyages réservés par cet utilisateur
    const travels = await Travel.find({ userId: userId }) // Filtrer par userId
      .populate({
        path: "trajetId",
        populate: [
          { path: "departure", select: "name ville" },
          { path: "destination", select: "name ville" },
        ],
      });

    // Répondre avec les données
    return res.status(200).json({
      success: true,
      message: "Voyages récupérés avec succès.",
      travels: travels,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des voyages :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};


//   
const getTravelsByUser = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur depuis les paramètres de la requête
  
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Trouver les voyages réservés par cet utilisateur
    const travels = await Travel.find({ userId: id }) // Filtrer par userId
      .populate({
        path: "trajetId",
        populate: [
          { path: "departure", select: "name ville" },
          { path: "destination", select: "name ville" },
        ],
      });

    // Répondre avec les données
    return res.status(200).json({
      success: true,
      message: "Voyages récupérés avec succès.",
      travels: travels,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des voyages :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};


const getTravelStatsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Convertir userId en ObjectId pour éviter les erreurs
    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // Vérifier que l'utilisateur existe
    const user = await User.findById(objectIdUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    const totalVoyages = await Travel.countDocuments({ userId: objectIdUserId, terminated: false });

    // Vérification des voyages non effectués (terminated: false)
    const totalEffectues = await Travel.countDocuments({
      userId: objectIdUserId,
      terminated: true,
    });
    const totalBudget = await Travel.aggregate([
      { $match: { userId: objectIdUserId } }, // Correctement associer à ObjectId
      { $group: { _id: null, totalPrice: { $sum: "$priceTotal" } } },
    ]);

    // Calculer le totalBudget
    const budgetEffectue = totalBudget.length > 0 ? totalBudget[0].totalPrice : 0;

    // Répondre avec les statistiques
    return res.status(200).json({
      success: true,
      data: {
        totalVoyages,
        totalEffectues,
        budgetEffectue,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de voyage :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};




export {getTravelsByUser,getTravelStatsByUser,getTerminatedStatus,updateTerminatedStatus,getTravelsByUserCity ,addTravel,getTravels,getTravel,addPlaceToTravel,deleteTravel,updateTravel,validateTravel }





