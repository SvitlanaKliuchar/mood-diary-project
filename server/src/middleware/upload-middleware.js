import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//configure storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "..", "public", "uploads");
    cb(null, uploadPath);
  },
  //create a unique filename with sanitization
  filename: function (req, file, cb) {
    // extract just the filename (no path components)
    const originalName = path.basename(file.originalname);

    // sanitize filename - only allow alphanumeric, dots, hyphens
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "");

    // get file extension safely
    const safeExtension = path.extname(safeName).toLowerCase();

    // create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // final filename: timestamp-random-sanitizedname.ext
    const finalName = `${uniqueSuffix}-${safeName}`;

    cb(null, finalName);
  },
});

//file filter to only accept specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|svg|png|gif/;
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/svg+xml",
  ];

  // use sanitized filename for extension check
  const originalName = path.basename(file.originalname);
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "");
  const extname = allowedTypes.test(path.extname(safeName).toLowerCase());
  const mimetype = allowedMimes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed (jpeg, jpg, svg, png, gif)"));
  }
};

//initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, //5mb limit
  fileFilter: fileFilter,
});

export default upload;
