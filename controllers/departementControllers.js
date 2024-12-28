import Departement from "../models/Departement.js";

const getDepartements = async(req,res)=>{
    try {

        const departements = await Departement.find()
        console.log("depart:",departements)
        return res.status(200).json({success:true, departements})
        
    } catch (error) {

        return res.status(500).json({
            succes:false, error:"get departement server error"
        })
        
    }
}


const addDepartement = async (req, res) => {
    try {
        const { name, ville } = req.body;

        // Validation des données
        if (!name) {
            return res.status(400).json({ succes: false, error: "Le champ 'name' est requis." });
        }

        console.log("Création d'un nouveau département :", { name, ville });

        const newDep = new Departement({
            name,
            ville,
        });
        await newDep.save();

        console.log("Département créé :", newDep);

        return res.status(200).json({ succes: true, departement: newDep });
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un département :", error);
        return res.status(500).json({ succes: false, error: "add departement server error" });
    }
};

const getDepartment = async(req,res)=>{
    try {

        const {id} = req.params;
        const departement = await Departement.findById({_id:id})
        
        return res.status(200).json({success:true, departement})
        
    } catch (error) {

        return res.status(500).json({
            succes:false, error:"get departement server error"
        })
        
    }
        
    
}



const updateDepartment = async(req,res)=>{
    try {
        const {id} = req.params;
        const {name,ville} = req.body;
        const updateDep = await Departement.findByIdAndUpdate({_id: id},{name,ville})
        
        return res.status(200).json({success:true, updateDep})
        
    } catch (error) {

        return res.status(500).json({
            succes:false, error:"put departement server error"
        })
        
    }
        
    
}

const deleteDepartment= async (req,res)=>{

    try {
        const {id} = req.params;
        const deleteDep = await Departement.findByIdAndDelete({_id: id})
        
        return res.status(200).json({success:true, deleteDep})
        
    } catch (error) {

        return res.status(500).json({
            succes:false, error:"delete departement server error"
        })
        
    }

}


export {addDepartement,getDepartements,updateDepartment,getDepartment,deleteDepartment}



