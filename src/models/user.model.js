import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"; // jwt is bearer token mtlb juiispe bhi ye token hoga usse hm data bhej denge ya access denge
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar : {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory: [
        { // ye array isliye banaya taki user kai videos ko apne history m rkh ske
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    refreshToken: {
        type: String, 
    }

},
    {
        timestamps: true,
    }
)
// not workingYou are using BOTH of these together: async function (next) calling next()
// userSchema.pre("save", async function (next) {  // ye pre save hook h jo mongoose ka feature h jb bhi user model ka koi document save hoga toh ye function call hoga is,me hmne arrow function use nhi kiya kyoki isme humein this ka refrence use krna tha
//     if(!this.isModified("password")) return next();// ye check krne k liye h ki kya password modify hua h ya nhi jb bhi user apna password change karega toh ye condition true hogi

//     this.password = await bcrypt.hash(this.password, 10); // ye line password ko hash krne k liye h jisse ki password database m plain text m na jaye
//     next();
// });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // ye method password ko compare krne k liye h jo user login krta h aur jo database m stored h
}

userSchema.methods.generateAccessToken = function () {  // accessToken genrally short lived hote h aur refresh token long lived hote h
   return jwt.sign(              // jwt ka sign method use krke hm token generate krte h
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,  // right side this.fullname databse se aa rha h
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }

    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}
export const User = mongoose.model("User", userSchema);