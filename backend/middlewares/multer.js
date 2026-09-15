import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(process.cwd(), "public");
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {
        console.error("Could not create public directory:", e);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (err) {
            cb(err, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, safeName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});

export default upload;