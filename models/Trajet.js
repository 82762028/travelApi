import mongoose from 'mongoose';
const { Schema } = mongoose; 
const TrajetSchema = new mongoose.Schema({
  departure: { type: mongoose.Schema.Types.ObjectId, ref: 'Departement', required: true }, 
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Departement', required: true }, 
  price: { type: Number, required: true }, 
  duree: { type: String},
  compagnieId: { type: mongoose.Schema.Types.ObjectId, ref: "Compagnie" },
  hours: [
    {
      time:{
        type:String,
      }
    }
  ] ,// Attribut pour l'heure (format HH:mm)
  createAt:{type:Date, default: Date.now},
  updateAt:{type:Date, default:Date.now},
});

const Trajet = mongoose.model("Trajet", TrajetSchema);

export default Trajet;

