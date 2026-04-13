import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

export const generateToken = (email, role) => {
    const secret = process.env.JWT_SECRET;
    if(!secret){
        throw new Error("secret not defined");
    }
    return jwt.sign({email, role},secret, {expiresIn: "1d"});
}