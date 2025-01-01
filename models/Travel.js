import mongoose from 'mongoose';
const { Schema } = mongoose; 
const TravelSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  places: [
    {
      place: {
        type: String,
      },
    },
  ],
  travelId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nombre: { type: Number, required: true },
  priceTotal: { type: Number},
  time: { type: String, required: true },
  arrived: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trajetId: { type: mongoose.Schema.Types.ObjectId, ref: "Trajet", required: true },
  valide: { type: Boolean, default: false },
  compagnie:{ type: String },
  statut:{ type: String,default:"not" },
  terminated: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});


const Travel = mongoose.model("Travel", TravelSchema);

export default Travel;
