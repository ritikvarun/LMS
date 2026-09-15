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

// Fallback to local storage if Bunny Stream credentials are not yet configured in .env
const saveLocally = (filePath) => {
    try {
        const videosDir = path.join("public", "videos");
        if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir, { recursive: true });
        }
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = `${Date.now()}_${base}${ext}`;
        const targetPath = path.join(videosDir, filename);

        fs.copyFileSync(filePath, targetPath);
        safeDelete(filePath);

        const localUrl = `http://localhost:8000/public/videos/${filename}`;
        console.log(`ℹ️ Bunny Stream credentials not set. Saved video locally: ${localUrl}`);
        return localUrl;
    } catch (e) {
        console.error("Local save error:", e);
        throw e;
    }
};

/**
 * Uploads a video to Bunny Stream
 * @param {string} filePath - Path of the uploaded file on disk
 * @param {string} title - Title of the video / lecture
 * @returns {Promise<string>} - The Bunny Stream embed player URL
 */
export const uploadOnBunny = async (filePath, title = "Lecture Video") => {
    if (!filePath) return null;

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    // Check if Bunny credentials exist
    if (!libraryId || !apiKey || libraryId.trim() === "" || apiKey.trim() === "") {
        console.warn("⚠️ BUNNY_STREAM_LIBRARY_ID or BUNNY_STREAM_API_KEY missing in .env! Storing locally as fallback...");
        return saveLocally(filePath);
    }

    try {
        console.log(`🚀 Creating video object on Bunny Stream for: "${title}"...`);

        // Step 1: Create the video entry in Bunny Stream
        const createVideoRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
            method: "POST",
            headers: {
                AccessKey: apiKey,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                title: title || path.basename(filePath)
            })
        });

        if (!createVideoRes.ok) {
            const errorText = await createVideoRes.text();
            throw new Error(`Bunny Create Video failed: ${createVideoRes.status} ${errorText}`);
        }

        const videoData = await createVideoRes.json();
        const videoId = videoData.guid;
        console.log(`✅ Video entry created on Bunny Stream with ID: ${videoId}`);

        // Step 2: Upload video binary file stream
        console.log(`📤 Uploading video file to Bunny Stream (${filePath})...`);
        const fileStream = fs.createReadStream(filePath);

        const uploadRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
            method: "PUT",
            headers: {
                AccessKey: apiKey,
                "Content-Type": "application/octet-stream"
            },
            duplex: "half",
            body: fileStream
        });

        if (!uploadRes.ok) {
            const uploadError = await uploadRes.text();
            throw new Error(`Bunny Video upload failed: ${uploadRes.status} ${uploadError}`);
        }

        // Delete temporary file from server
        safeDelete(filePath);

        // Step 3: Construct the responsive embed URL
        const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
        console.log(`🎉 Bunny Stream Upload Complete! Embed URL: ${embedUrl}`);
        return embedUrl;
    } catch (error) {
        console.error("❌ Bunny Stream upload error:", error);
        safeDelete(filePath);
        throw error;
    }
};

/**
 * Deletes a video from Bunny Stream if needed
 * @param {string} videoIdOrUrl - Video ID (guid) or embed URL
 */
export const deleteFromBunny = async (videoIdOrUrl) => {
    if (!videoIdOrUrl) return;

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) return;

    try {
        // Extract guid if full embed URL was passed
        let videoId = videoIdOrUrl;
        if (videoIdOrUrl.includes("/")) {
            const parts = videoIdOrUrl.split("/");
            videoId = parts[parts.length - 1];
        }

        const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
            method: "DELETE",
            headers: {
                AccessKey: apiKey
            }
        });

        if (res.ok) {
            console.log(`🗑️ Deleted video ${videoId} from Bunny Stream`);
        }
    } catch (err) {
        console.warn(`Could not delete video from Bunny:`, err.message);
    }
};

export default uploadOnBunny;
