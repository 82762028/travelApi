import Trajet from "../models/Trajet.js"
import bcrypt from "bcrypt"
import Departement from "../models/Departement.js"

const addTrajet = async (req, res) => {
  try {
    const { departure, destination, price, hours,duree,compagnieId } = req.body;

    // Vérifier si un trajet avec la même departure et destination existe déjà
    const existingTrajet = await Trajet.findOne({ departure, destination,compagnieId });
    if (existingTrajet) {
      return res.status(400).json({
        success: false,
        message: "Un trajet avec cette departure et destination pour ce compagnie existe déjà.",
      });
    }

    // Créer et sauvegarder le nouveau trajet
    const newTrajet = new Trajet({
      departure,
      destination,
      compagnieId,
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
      .populate('departure', 'ville') // Peuple le champ "departure" (champ `ville` uniquement)
      .populate('destination', 'ville') // Peuple le champ "destination" (champ `ville` uniquement)
      .populate('compagnieId', 'name image'); // Inclure les champs "name" et "image" du modèle `Compagnie`

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



const getAppTrajets = async (req, res) => {
  try {
    const { compagnie } = req.body; // Récupère la compagnie depuis le body de la requête

    if (!compagnie) {
      return res.status(400).json({
        success: false,
        error: 'Le champ compagnie est requis.',
      });
    }

    // Recherche des trajets filtrés par compagnie
    const trajets = await Trajet.find({})
      .populate('departure', 'ville') // Peuple le champ "departure" (champ `ville` uniquement)
      .populate('destination', 'ville') // Peuple le champ "destination" (champ `ville` uniquement)
      .populate({
        path: 'compagnieId',
        select: 'name image',
        match: { name: compagnie }, // Filtre par nom de la compagnie
      });

    // Filtre les trajets dont `compagnieId` est null après le peuplement
    const filteredTrajets = trajets.filter((trajet) => trajet.compagnieId);

    res.status(200).json({
      success: true,
      Trajets: filteredTrajets,
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
      })
      .populate({
        path: 'compagnieId', // Relation pour `CompagnieId`
        select: 'name image', // Inclure "name" et "image"
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
    const { departure, destination, price, hours, duree, compagnieId, days } = req.body; // Données à mettre à jour

    // Vérifier si le trajet existe
    const trajet = await Trajet.findById(id);
    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet non trouvé." });
    }

    // Validation des jours
    if (days) {
      if (!Array.isArray(days) || days.some((day) => typeof day !== "number" || day < 0 || day > 6)) {
        return res.status(400).json({
          success: false,
          message: "La liste des jours est invalide. Elle doit contenir des nombres entre 0 et 6.",
        });
      }

      // Mettre à jour les jours dans le modèle
      trajet.days = days.map((day) => ({ date: day }));
    }

    // Mise à jour des champs optionnels
    if (departure) trajet.departure = departure;
    if (destination) trajet.destination = destination;
    if (price) trajet.price = price;
    if (duree) trajet.duree = duree;
    if (compagnieId) trajet.compagnieId = compagnieId;

    // Validation et mise à jour des heures
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
          message:
            "Certaines heures sont invalides. Assurez-vous que les heures sont au format HH:mm.",
        });
      }

      trajet.hours = validHours; // Remplace les heures existantes
    }

    // Mise à jour de la date de modification
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


const addDayToTrajet = async (req, res) => {
  try {
    const { id } = req.params; // ID du trajet
    const { day } = req.body; // Jour à ajouter (0 pour dimanche, 1 pour lundi, etc.)

    // Vérifier si le jour est valide
    if (typeof day !== "number" || day < 0 || day > 6) {
      return res.status(400).json({
        success: false,
        message: "Le jour est invalide. Il doit être un nombre compris entre 0 et 6.",
      });
    }

    // Rechercher le trajet
    const trajet = await Trajet.findById(id);
    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet non trouvé." });
    }

    // Vérifier si le jour existe déjà
    const isDuplicate = trajet.days.some((d) => d.date === day);
    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: `Le jour ${day} existe déjà pour ce trajet.`,
      });
    }

    // Ajouter le jour et sauvegarder
    trajet.days.push({ date: day });
    await trajet.save();

    return res.status(200).json({
      success: true,
      message: "Jour ajouté avec succès.",
      trajet,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du jour :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'ajout du jour.",
    });
  }
};



export { addDayToTrajet,getAppTrajets,addTrajet,getTrajets,getTrajet,addHourToTrajet,updateTrajet,deleteTrajet}





