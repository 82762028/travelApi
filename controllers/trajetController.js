import Trajet from "../models/Trajet.js"
import bcrypt from "bcrypt"
import Departement from "../models/Departement.js"

const addTrajet = async (req, res) => {
  try {
    const { departure, destination, price, hours,duree } = req.body;

    // Vérifier si un trajet avec la même departure et destination existe déjà
    const existingTrajet = await Trajet.findOne({ departure, destination });
    if (existingTrajet) {
      return res.status(400).json({
        success: false,
        message: "Un trajet avec cette departure et destination existe déjà.",
      });
    }

    // Créer et sauvegarder le nouveau trajet
    const newTrajet = new Trajet({
      departure,
      destination,
      price,
      duree
    });

    await newTrajet.save();
    return res.status(200).json({ success: true, message: "Trajet créé avec succès." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur lors de l'ajout du trajet." });
  }
};

const addHourToTrajet = async (req, res) => {
  try {
    const { id } = req.params; // ID du trajet
    let { time } = req.body; // Heure à ajouter

    // Normaliser l'heure pour qu'elle soit au format HH:mm
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      return res.status(400).json({
        success: false,
        message: `L'heure est invalide : ${time}. Le format attendu est HH:mm.`,
      });
    }

    let [_, hours, minutes] = timeMatch;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    // Vérifier que l'heure est entre 00 et 23 et que les minutes sont entre 00 et 59
    if (hours < 0 || hours > 23) {
      return res.status(400).json({
        success: false,
        message: `L'heure doit être comprise entre 00 et 23.`,
      });
    }
    if (minutes < 0 || minutes > 59) {
      return res.status(400).json({
        success: false,
        message: `Les minutes doivent être comprises entre 00 et 59.`,
      });
    }

    // Normalisation de l'heure (ajout de zéro devant si nécessaire)
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    time = `${hours}:${minutes}`;

    // Rechercher le trajet
    const trajet = await Trajet.findById(id);
    if (!trajet) {
      return res.status(404).json({ success: false, message: 'Trajet non trouvé.' });
    }

    // Vérifier si l'heure existe déjà
    const isDuplicate = trajet.hours.some((h) => h.time === time);
    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: `L'heure ${time} existe déjà pour ce trajet.`,
      });
    }

    // Ajouter l'heure et sauvegarder
    trajet.hours.push({ time });
    await trajet.save();

    return res.status(200).json({
      success: true,
      message: 'Heure ajoutée avec succès.',
      trajet,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Erreur serveur lors de l'ajout de l'heure." });
  }
};



const getTrajets = async (req, res) => {
  try {
    const trajets = await Trajet.find()
      .populate('departure', 'ville') // Peuple le champ "departure" et ne récupère que la propriété "ville"
      .populate('destination', 'ville'); // Peuple le champ "destination" et ne récupère que la propriété "ville"

    res.status(200).json({
      success: true,
      Trajets: trajets,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des trajets.',
    });
  }
};

const getTrajet = async (req, res) => {
  try {
    const { id } = req.params;
    const trajet = await Trajet.findById(id)
      .populate({
        path: 'departure', // Relation pour `departure`
        select: 'name ville', // Champs spécifiques à inclure
      })
      .populate({
        path: 'destination', // Relation pour `destination`
        select: 'name ville', // Champs spécifiques à inclure
      });

    if (!trajet) {
      return res.status(404).json({ success: false, message: 'Trajet non trouvé.' });
    }

    return res.status(200).json({ success: true, trajet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const updateTrajet = async (req, res) => {
  try {
    const { id } = req.params; // ID du trajet
    const { departure, destination, price, hours,duree } = req.body; // Données à mettre à jour

    // Vérifier si le trajet existe
    const trajet = await Trajet.findById(id);
    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet non trouvé." });
    }
    

    // Mise à jour des champs
    if (departure) trajet.departure = departure;
    if (destination) trajet.destination = destination;
    if (price) trajet.price = price;
    if (duree) trajet.duree = duree;
    // Valider et mettre à jour les heures
    if (hours && Array.isArray(hours)) {
      const validHours = hours.filter(({ time }) => {
        const match = /^(\d{2}):(\d{2})$/.exec(time);
        if (!match) return false; // Format invalide
        const [_, hour, minute] = match.map(Number);
        return hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
      });

      if (validHours.length !== hours.length) {
        return res.status(400).json({
          success: false,
          message: "Certaines heures sont invalides. Assurez-vous que les heures sont au format HH:mm, non contenant des caractère.",
        });
      }

      trajet.hours = validHours; // Remplace les heures existantes
    }

    // Mise à jour de la date
    trajet.updateAt = Date.now();

    // Sauvegarder les modifications
    const updatedTrajet = await trajet.save();

    return res.status(200).json({
      success: true,
      message: "Trajet mis à jour avec succès.",
      trajet: updatedTrajet,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du trajet :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du trajet.",
    });
  }
};


const deleteTrajet = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID du trajet à supprimer

    // Vérifier si le trajet existe
    const trajet = await Trajet.findById(id);
    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet non trouvé." });
    }

    // Supprimer le trajet
    await Trajet.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Trajet supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression du trajet.",
    });
  }
};

export {addTrajet,getTrajets,getTrajet,addHourToTrajet,updateTrajet,deleteTrajet}





