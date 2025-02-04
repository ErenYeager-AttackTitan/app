import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

app.get('/vid.mp4', (req, res) => {
    const videoPath = path.join(__dirname, 'vid.mp4');
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/x-matroska',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/x-matroska',
        };

        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

// Read and serve index.html
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error loading the page.");
      return;
    }
    res.send(data);
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

