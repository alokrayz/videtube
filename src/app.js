import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,   // an hmne .env m cors_origin ko all p set kiya isse hm khi se bhi acces ya request bhej skte h server m
    credentials : true,
}));

app.use(express.json({
    limit: "16kb"    // ye hmne isliye use kiya taki jb bhi client se data aaye toh vo json format m aaye aur size 16kb se jyada na ho
})); 

app.use(express.urlencoded({ /// ye hm tab use krte h jb form data bhejna ho server ko
    extended: true,
    limit: "16kb"
})); 

app.use(express.static("public")); // ye hm static file serve krne k liye use krte h jaise image css js file etc jo frontend m use hoti h

app.use(cookieParser());  // ye hm cookie ko parse krne k liye use krte h taki jb bhi client se cookie aaye toh vo easily read ho jaye server m cookie p crud operation perform kr ske




export {app};



// app.use hm jb use krte h jb hme koimiidleware ka configuratio use krna ho