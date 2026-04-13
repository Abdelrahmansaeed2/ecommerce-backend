import mongoose from "mongoose";
import bcrypt from "bcrypt"
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }, 
    email:{
        type: String,
        required: true,
        validate:{
            validator: function(email){
            return emailRegex.test(email);
            },
            message: 'the email provided is not valid'
        }
    },
    role:{
        type: String,
        enum: ["User","Admin"],
        default: "User"
    }
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
});

export default mongoose.model("User",userSchema);