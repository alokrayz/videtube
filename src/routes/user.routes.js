import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    upload.fields([             //ye middleware isse multiple files upload krne k liye fields use krte h
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(VerifyJWT, logoutUser); // adding middleware to verify jwt token
router.route("/refresh-token").get(refreshAccessToken);

export default router; // jb export default krte h tb import aisre hota h isse hm jb bhi import krenge toh isse mnchaha naam de skte h
