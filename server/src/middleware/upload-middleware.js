import multer from "multer";
import path from 'path';
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//configure storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');
        cb(null, uploadPath); 
    },
    //create a unique filename
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

//file filter to only accept specific file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|svg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb(new Error("Only images are allowed (jpeg, jpg, svg, png, gif)"))
    }
}

//initialize multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, //5mb limit
    fileFilter: fileFilter
})

export default upload