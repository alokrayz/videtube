import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for uploaded files
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {  //cb callback h

    cb(null, file.originalname)  // jo file upload hoga uska original name hi rhega

  },
})

export const upload = multer({ storage: storage });