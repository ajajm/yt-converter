// Importing required modules
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const ytdlp = require("yt-dlp-exec");

const now = new Date()
const MM = String(now.getMonth()+1).padStart(2, "0");
const DD = String(now.getDate()).padStart(2, "0");
const MIN = String(now.getMilliseconds()).padStart(2, "0");
const app = express();
const port = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Folder for downloads
const downloadPath = path.join(__dirname, "download");
if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

// Server the frontend from the "dist" folder (react build) 
const frontendPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendPath));

// Defining the Roots
app.get(/.*/, (req, res) => {             
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Download video (MP4)
app.post("/download/video", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const output = path.join(downloadPath, `video_${MM}${DD}${MIN}.mp4`);

    await ytdlp(url, {      //yt-dlp module execute the parameters(url and output format)
      output,
      format: "mp4",
    });

    console.log(" Video downloaded:", output);

    res.download(output, () => {
      fs.unlinkSync(output); // delete after sending (for cloud)
    });
  } catch (err) {
    console.error("Error downloading video:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

// Download audio (MP3)
app.post("/download/music", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const output = path.join(downloadPath, `audio_${MM}${DD}${MIN}.mp3`);

    await ytdlp(url, {      //yt-dlp module execute the parameters(url and output format)
      extractAudio: true,
      audioFormat: "mp3",
      output,
    });

    console.log("Audio downloaded:", output);

    res.download(output, () => {
      fs.unlinkSync(output); // (for production server) delete after sending
    });
  } catch (err) {
    console.error("Error downloading audio:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

app.listen(port, "0.0.0.0", () => {       //server listening on all network interfaces(0.0.0.0 for testing)
  console.log(`Server running at PORT : ${port}`);
});
