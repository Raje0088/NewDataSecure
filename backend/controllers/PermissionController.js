const {UserModel, PermissionModel} = require("../models/user")

//Assign permission to a user
const assignPermission = async(req,res)=>{
    try{

    }catch(err){
        console.log("internal error in permission",err)
        res.status(500).json({message:"internal error in permission",err:err.message})
    }
}