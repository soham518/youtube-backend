import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true //this will make it easy for searchable
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        avatar: {
            type: String, //cloudinary url to store image and 
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password: { //done.
            type: String,
            required: [true,'Password is required']
        },
        refreshToken: { //done
            type: String
        }},{ timestamps: true});

//we dont use arrow function because it does not provides the reference of this to the document.
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    //encrypt password only when password is modified
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//check the password entered by the user.
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    //.sign takes 3 arguments: jwt.sign(payloads, accesstoken, accesstokenexpiry)
   return  jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
   )
}
userSchema.methods.generateRefreshToken = async function () {
       return  jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
   )
}
export const User = mongoose.model("User", userSchema);