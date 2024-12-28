import User from "../models/User.js"
import bcrypt from "bcrypt"
import Departement from "../models/Departement.js"
import { io } from "../index.js";

const addUser = async (req, res) => {
  try {
    const { name, email, telephone, password, ville, role } = req.body;

    if (!/^\d{8}$/.test(telephone)) {
      return res.status(400).json({
        success: false,
        error: "Le numéro de téléphone doit comporter exactement 8 chiffres.",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { telephone }] });
    if (existingUser) {
      const message =
        existingUser.email === email
          ? "Email déjà inscrit."
          : "Numéro de téléphone déjà inscrit.";
      return res.status(400).json({ success: false, error: message });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      telephone,
      ville,
      password: hashPassword,
      role,
    });

    await newUser.save();

    // Émettre un événement socket lorsqu'un utilisateur est ajouté
    io.emit("user_added", newUser);

    return res.status(200).json({ success: true, message: "User created", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error in adding User" });
  }
};



const getUsers = async(req,res)=>{
   try {

   const Users = await User.find()
      return res.status(200).json({success:true, Users})
      
  } catch (error) {

      return res.status(500).json({
          succes:false, error:"get Users server error"
      })
      
  }

}


const getUser = async(req,res)=>{
    const {id} = req.params;
    try {
 
    const Users = await User.findById({_id:id})
       return res.status(200).json({success:true, Users})
       
   } catch (error) {
 
       return res.status(500).json({
           succes:false, error:"get Users server error"
       })
       
   }
 
 }

const getView = async(req,res)=>{
  const {id} = req.params;
  try {

  const Users = await User.findById({_id:id})
     return res.status(200).json({success:true, view: Users.view})
     
 } catch (error) {

     return res.status(500).json({
         success:false, error:"get Users server error"
     })
     
 }

}
 const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, telephone, password, role, ville } = req.body;

    // Fetch the user to verify it exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Vérification de la longueur du numéro de téléphone
    if (telephone && !/^\d{8}$/.test(telephone)) {
      return res.status(400).json({
        success: false,
        error: "Le numéro de téléphone doit comporter exactement 8 chiffres.",
      });
    }

    // Vérifiez si l'email ou le numéro de téléphone est déjà utilisé par un autre utilisateur
    if (telephone) {
      const userWithSamePhone = await User.findOne({
        telephone,
        _id: { $ne: id }, // Exclut l'utilisateur actuel de la vérification
      });
      if (userWithSamePhone) {
        return res
          .status(400)
          .json({ success: false, error: "Numéro de téléphone déjà inscrit." });
      }
    }

    if (email) {
      const userWithSameEmail = await User.findOne({
        email,
        _id: { $ne: id },
      });
      if (userWithSameEmail) {
        return res.status(400).json({ success: false, error: "Email déjà inscrit." });
      }
    }

    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email;
    if (telephone) userUpdates.telephone = telephone;
    if (password) {
      userUpdates.password = await bcrypt.hash(password, 10);
    }
    if (role) userUpdates.role = role;
    if (ville) userUpdates.ville = ville;

    const updatedUser = await User.findByIdAndUpdate(id, userUpdates, { new: true });
    return res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Update User error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Delete User error" });
  }
};


const markUserAsViewed = async (req, res) => {
  const { id } = req.params; // Récupère l'id depuis les paramètres de la requête

  try {
    // Recherche l'utilisateur et met à jour le champ "view" à true
    const user = await User.findByIdAndUpdate(
      id,
      { view: true, updateAt: Date.now() },
      { new: true } // Retourne l'utilisateur mis à jour
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "L'utilisateur a été marqué comme vu", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};


const verifyUser = async (req, res) => {
  try {
    const { id, password } = req.body;

    // Cherchez l'utilisateur par son ID
    const user = await User.findById(id);
    console.log("User ID:", user);


    if (!user) {
      return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
    }

    // Vérifiez le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: "Mot de passe incorrect" });
    }

    // Réponse de succès si tout va bien
    return res.status(200).json({ success: true, message: "Vérification réussie" });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur :", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

export {verifyUser,addUser,getUsers,getUser,updateUser,deleteUser, markUserAsViewed ,getView}





