import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload the file on cloudinary abhi filer server p h hum use cloudinary p upload kr rhe h
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // ye auto isliye h taki koi bhi file ho usse upload kr ske
        })
        // File has been uploaded succesfully
        // console.log("File uploaded to Cloudinary successfully", response.url); // response m cloudinary ka url a jayga jaha file upload hui h
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary};


// koid data kaise store hoga  ---> pehle hm use tempory file m store krenge localfilepath phir usse hm cloudinary p krenge direct bhi kr skte h lekin vo thoda risky h isliye pehle localfile m store kr rhe h phir cloudinary p upload kr rhe h toh jo uploadonclodinary function h usme hmne localdfilepath se data bheja h upto upload on clodinary