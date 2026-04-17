

import category from "../models/categoreymodel.js";

export const createCategory = async(req,res)=>{
    try{
        const {name}=req.body;
        if(!name)
{
    return res.status(400).json({ message:"name is required"})

}    
if(typeof name !== "string"){
    return res.status(400).json({ message:"name must be string"})
}
if(name.trim().length<2){
    return res.status(400).json({ message:"name must be at least 2 characters"})
}
const existing = await category.findOne({name: { $regex: `^${name.trim()}$`, $options: "i" }
});

if(existing){
    return res.status(400).json({ message:"category already exists"})
}

const createdCategory = await category.create({name:name.trim()});
return res.status(201).json({createdCategory,message:"category created successfully"});
    }catch(erro){
        return res.status(500).json({message:erro.message});
    }
};

export const getallcategories = async(req,res)=>{
    try{
        const categories = await category.find().sort({createdAt:-1});
        return res.status(200).json({categories,message:"all categories"});
    }catch(error){
        return res.status(500).json({message:error.message});
        
    }
};

export const getcategory = async(req,res)=>{
    try{
        const {id} = req.params;
        const categorys = await category.findById(id);
        if(!categorys){
            return res.status(404).json({message:"category not found"});
}

return res.status(200).json({categorys,message:"category found"});
    }catch(error){
        return res.status(500).json({message:error.message});
    }
};

export const updatecategory = async(req,res)=>{
    try{
        const {id} = req.params;
        const {name} = req.body;
        if(!name){
            return res.status(400).json({message:"name is required"});
}

     if(name.trim().length<2){
    return res.status(400).json({message:"name must be at least 2 characters"});
}

const category= await category.findById(id);
if(!category){
    return res.status(404).json({message:"category not found"});
}
category.name = name.trim();
await category.save();
return res.status(200).json({category,message:"category updated successfully"});
    }catch(error){
        return res.status(500).json({message:error.message});
    }
};


export const deletecategory = async(req,res)=>{
    try{
        const {id} = req.params;
        const category = await category.findById(id);
        if(!category){
            return res.status(404).json({message:"category not found"});
        }
await category.deleteOone();

return res.status(200).json({message:"category deleted successfully"});
    }catch(error){
        return res.status(500).json({message:error.message});
    }
};
