
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
});

// require("dotenv").config(); ----> ye wla import code kinconsistency ko khrab krta h so we will use diif f method



// one way to connect mongodb is to write connection cod in maon index.js file by creating funvtion and using after it
/*
function connectDB() {}

connectDB();
alternative using iffe that is function after function ;()() semicolon is used to avoid error if some code is written after this function
*/

// other way is to create separate file for connection like db.js and export the function and import it in index.js and use it there


connectDB()       // jo humne db ki file likhi wha humne async method likha aur jb bhi asssync method comoplete hota h toh vo promise bhi return krta h iske liye hm .the aur cath use krta h
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("Failed to connect to DB !!!", err);
})


















/*
(async () => {
    try {
        mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);
        app.on("err", (error) => {
            console.log("ERR:", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log("Error in DB connection", error);
        throw error;
    }
})()

*/