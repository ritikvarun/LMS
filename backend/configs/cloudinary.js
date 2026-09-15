import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import path from "path";

const safeDelete = (filePath) => {
    if (!filePath) return;
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                setTimeout(() => {
                    fs.unlink(filePath, () => {});
                }, 3000);
            }
        });
    }, 2000);
};

const saveLocally = (filePath) => {
    try {
        const videosDir = path.resolve(process.cwd(), "public", "videos");
        if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir, { recursive: true });
        }
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = `${Date.now()}_${base}${ext}`;
        const targetPath = path.join(videosDir, filename);

        fs.copyFileSync(filePath, targetPath);
        safeDelete(filePath);

        const serverBase = (process.env.SERVER_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://lms-jcpg.onrender.com")).replace(/\/+$/, "");
        const localUrl = `${serverBase}/public/videos/${filename}`;
        console.log(`✅ Saved large video locally (>95MB limit): ${localUrl}`);
        return localUrl;
    } catch (e) {
        console.error("Local save error:", e);
        throw e;
    }
};

const uploadOnCloudinary = (filePath, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        if (!filePath) {
            return resolve(null);
        }

        // Cloudinary Free tier enforces a strict 100MB (104857600 bytes) max limit per video.
        // If file is > 95 MB, automatically save locally so upload never fails!
        try {
            const stats = fs.statSync(filePath);
            const sizeInMB = stats.size / (1024 * 1024);
            console.log(`Upload file size: ${sizeInMB.toFixed(1)} MB`);

            if (sizeInMB > 95) {
                console.log("File is over Cloudinary 100MB free limit. Automatically storing locally...");
                const localUrl = saveLocally(filePath);
                return resolve(localUrl);
            }
        } catch (err) {
            console.warn("Could not check file size:", err.message);
        }

        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
        });

        console.log(`Starting Cloudinary upload for: ${filePath} (${resourceType})...`);

        cloudinary.uploader.upload_large(
            filePath,
            {
                resource_type: resourceType,
                chunk_size: 6000000 // 6MB chunks for large files
            },
            (err, result) => {
                if (err) {
                    console.error("Cloudinary upload error:", err);
                    // Automatic fallback if Cloudinary throws size limit error
                    if (err.message && err.message.includes("File size too large")) {
                        console.log("Cloudinary rejected due to file size. Falling back to local storage...");
                        try {
                            const localUrl = saveLocally(filePath);
                            return resolve(localUrl);
                        } catch (saveErr) {
                            safeDelete(filePath);
                            return reject(saveErr);
                        }
                    }
                    safeDelete(filePath);
                    return reject(err);
                }
                safeDelete(filePath);
                console.log("Cloudinary Upload Success URL:", result.secure_url);
                return resolve(result.secure_url);
            }
        );
    });
};

export default uploadOnCloudinary;