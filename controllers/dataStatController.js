import Trajet from "../models/Trajet.js"
import bcrypt from "bcrypt"
import Departement from "../models/Departement.js"
import User from "../models/User.js"
import Travel from "../models/Travel.js"

const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ success: true, totalUsers });
  } catch (err) {
    console.error('Erreur lors du comptage des utilisateurs :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};



const getTotalDepartements = async (req, res) => {
  try {
    const totalDepartements = await Departement.countDocuments();
    res.status(200).json({ success: true, totalDepartements });
  } catch (err) {
    console.error('Erreur lors du comptage des départements :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};



const getTotalPriceCurrentMonth = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const totalPrice = await Travel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$priceTotal' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      totalPrice: totalPrice[0]?.total || 0,
    });
  } catch (err) {
    console.error('Erreur lors du calcul des prix des voyages :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};


const getTotalVoyagesPlanned = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const totalVoyages = await Travel.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    res.status(200).json({ success: true, totalVoyages });
  } catch (err) {
    console.error('Erreur lors de la récupération des voyages :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};


const getAverageParticipants = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const result = await Travel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          averageParticipants: { $avg: '$nombre' },
        },
      },
    ]);

    const averageParticipants = result[0]?.averageParticipants || 0;

    res.status(200).json({ success: true, averageParticipants });
  } catch (err) {
    console.error('Erreur lors du calcul des participants moyens :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const getDelayedTravels = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Ajoutez un champ "delayed" dans le modèle Travel pour identifier les voyages retardés
    const delayedTravels = await Travel.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth },
      delayed: true, // Supposez un champ "delayed" dans votre collection
    });

    res.status(200).json({ success: true, delayedTravels });
  } catch (err) {
    console.error('Erreur lors de la récupération des voyages retardés :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
const getTopDestination = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const result = await Travel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $lookup: {
          from: 'trajets', // Nom de la collection Trajet
          localField: 'trajetId', // Champ de jointure dans Travel
          foreignField: '_id', // Champ correspondant dans Trajet
          as: 'trajet',
        },
      },
      {
        $unwind: '$trajet', // Décompose le tableau résultant de la jointure
      },
      {
        $lookup: {
          from: 'departements', // Nom de la collection Departement
          localField: 'trajet.destination', // Champ de jointure dans Trajet
          foreignField: '_id', // Champ correspondant dans Departement
          as: 'destination',
        },
      },
      {
        $unwind: '$destination', // Décompose le tableau résultant de la jointure
      },
      {
        $group: {
          _id: '$destination.ville', // Grouper par ville de la destination
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 }, // Trier par nombre décroissant
      },
      {
        $limit: 1, // Limiter à une seule destination
      },
    ]);

    const topDestination = result[0]?._id || 'Aucune donnée';

    res.status(200).json({ success: true, topDestination });
  } catch (err) {
    console.error('Erreur lors de la récupération de la destination populaire :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};


export { getTotalUsers,getTotalDepartements,getTotalPriceCurrentMonth, getTotalVoyagesPlanned ,getAverageParticipants,getDelayedTravels,getTopDestination}





