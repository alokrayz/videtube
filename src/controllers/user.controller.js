import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();   // access token hm useer ko de dete h pr refresh token ko hm database m store kr lete h
        const refreshToken = user.generateRefreshToken();
       
        user.refreshToken = refreshToken; // db m store kr rhe h as present in user model
        await user.save({validateBeforeSave: false}); //validation mt lgao seedha jake save krdo
        return {
            accessToken,
            refreshToken
        };
    } catch (error) {
        throw new ApiError(500, "Something went wrong in creating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation -- not empty
    // check if user already exists: username, email
    // check for images , check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove access and refresh token field from response
    // check for user creation
    // return res

    const {fullName, username, email, password} = req.body;
    // console.log("email:", email);

    // if(fullName === ""){
    //     throw new ApiError(400,
    //  "Full name is required"); 
    // }

    if(
        [fullName, username, email, password].some((field) => 
            field?.trim () === "") 
    ) {
        throw new ApiError(400, "All fields are required");
    }   
    
    const existedUser = await User.findOne ({          
        $or: [{email}, {username}],
    })

    if(existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }
    // req.body m saara data h
    // express hmein req.body ka access deta h aur multer ka req.files ka deta h
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path; // ye path h jaha file temporarily store hui h ye abhi local path p jh cloudinary p upload nhi hua h
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if(req.files &&  Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // upload files to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // console.log(avatar); debugging
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Error in uploading avatar image");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,  // yha 100% validation h ki avatar h hi h yha p
        coverImage: coverImage?.url || "",  // but coverImage is not guaranteed
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"  // ye do fields response m nhi chahiye strinfgs h ye toh space deke likhni hoti h
    )

    if(!createdUser){
        throw new ApiError(500, "Error in creating user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username aur email
    // find the user
    // password check
    // accesss and refresh token
    // send cooke
    // send response

    const {email, username, password} = req.body;
    console.log(email);

    if(!username && !email){
        throw new ApiError (400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{email}, {username}],
    })

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password); // ye method user model m bana h

    
    if(!isPasswordValid){
        throw new ApiError(404, "Password Incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    // send cookie

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    // console.log("Logged in user:", loggedInUser);

    const options = {
        httpOnly: true, // waise hm normally token ko frontend se updtae kr skte  hhtp only use krke ye sirf backend se update ho skt H ab
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)  // app m cookie parser ki wjh se hm isse use kr pa rhe h
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    // clear cookies
    await User.findByIdAndUpdate(
        req.user._id,  // req.user m hmne auth middleware m user ka data store kr diya h
        {
            $set: {
                refreshToken: undefined // logout krne p refresh token ko db se remove kr denge
            }
        },
        {
            new: true // updated document return krne k liye
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
       
    }
     
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {} , "User logged out successfully")
    )

})

const refreshAccessToken = asyncHandler(async (req, res) => {             // access aur refresh token ka yeh kaam h ki use baar bqaar username aur password naa dena pde ab jb access token expire ho jaaye toh voh 401 error dega toh uss time pe hm refresh token ka use krke naya access token generate kr skte h bina username aur password diye
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken =jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
    
        const user = User.findById(decodedToken?._id)
         if(!user){
            throw new ApiError(401, "Invalid Refresh token");
        }
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "refresh token is expired or used");
        }
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token"); 
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};