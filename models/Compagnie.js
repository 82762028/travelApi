import mongoose from 'mongoose';


const CompagnieSchema = new mongoose.Schema({
  name: { type: String, required: true,unique:true },
  image: { type: String, required: true},
  createAt:{type: Date, default:Date.now()},
  updateAt:{type:Date, default:Date.now},
});


const Compagnie = mongoose.model("Compagnie", CompagnieSchema);

export default Compagnie;

/*
const DepartementSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom de la région ou département
  ville: { type: String, required: true }, // Nom de la ville
  country: { type: String }, // Optionnel : pour le pays
  code: { type: String }, // Optionnel : code administratif ou postal
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

const Departement = mongoose.model("Departement", DepartementSchema);

export default Departement;


*/