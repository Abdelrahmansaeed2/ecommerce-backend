import User from "../models/userModel.js";
import { generateToken } from "../utils/auth.js";
import { createError } from "../utils/error.js";

export const registerUser = async (req,res,next) =>{
    try{
        const { username, password, email, role } = req.body;
        if(!username || !password || !email){
            throw createError("Credentials incomplete, username, password and email are required",400);
        }

        const exists = await User.findOne({$or: [ {username: username}, {email: email} ]})

        if(exists){
            throw createError("Username or Email already exist",400);
        }

        const newUser = await User.create({
            username: username,
            password: password,
            email: email,
            role: role
        })

        if(!newUser){
            throw createError(`Error registering user`,500);
        }

        return res.status(201).json({message:"Registered user successfully", data: newUser});
    }
    catch(err){
        next(err);
    }
}


export const loginUser = async (req,res,next) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            throw createError("Email and/or password are missing",400);
        }

        const exists = await User.findOne({ email: email});

        if(!exists){
            throw createError("Email doesn't exist",400);
        }

        const isPasswordValid = await exists.checkPassword(password);
        if(!isPasswordValid){
            throw createError("incorrect password",400);
        }

        const token = generateToken(exists.email, exists.role);
        const userData = exists.toObject();
        delete userData.password;
        
        return res.status(200).json({
            message:"Login Successful",
            data: userData,
            token: token 
        })
    }
    catch(err){
        next(err);
    }

}