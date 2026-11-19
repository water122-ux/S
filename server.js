const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3030;
const DATA_DIR = path.join(__dirname, "data");
const MUSIC_DIR = path.join(DATA_DIR, "music");
const DB_FILE = path.join(DATA_DIR, "tracks.json");

fs.mkdirSync(MUSIC_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf8");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(express.json({ limit: "100kb" }));

function readTracks() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function writeTracks(tracks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tracks, null, 2), "utf8");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MUSIC_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".mp3", ".ogg"];
    if (!allowed.includes(ext)) return cb(new Error("Envie somente MP3 ou OGG."));
    cb(null, true);
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "Easy Jukebox Server" }));

app.get("/api/tracks", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const sort = String(req.query.sort || "newest");
  let tracks = readTracks().filter(t =>
    !q || `${t.title} ${t.artist}`.toLowerCase().includes(q)
  );
  if (sort === "popular") tracks.sort((a, b) => b.downloads - a.downloads);
  else tracks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const page = Math.max(1, Number.parseInt(req.query.page || "1", 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit || "20", 10)));
  const total = tracks.length;
  tracks = tracks.slice((page - 1) * limit, page * limit).map(({ filename, ...publicTrack }) => publicTrack);

  res.json({ tracks, page, limit, total });
});

app.post("/api/upload", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Arquivo de áudio ausente." });

  const title = String(req.body.title || "").trim().slice(0, 80);
  const artist = String(req.body.artist || "").trim().slice(0, 60);
  const rightsConfirmed = req.body.rightsConfirmed === "true";

  if (!title || !artist || !rightsConfirmed) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      error: "Informe título, artista e confirme que possui autorização para distribuir a música."
    });
  }

  const track = {
    id: crypto.randomUUID(),
    title,
    artist,
    format: path.extname(req.file.originalname).slice(1).toUpperCase(),
    size: req.file.size,
    downloads: 0,
    createdAt: new Date().toISOString(),
    filename: req.file.filename
  };

  const tracks = readTracks();
  tracks.push(track);
  writeTracks(tracks);

  const { filename, ...publicTrack } = track;
  res.status(201).json({ track: publicTrack });
});

app.get("/api/tracks/:id/file", (req, res) => {
  const tracks = readTracks();
  const track = tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: "Música não encontrada." });

  const filePath = path.join(MUSIC_DIR, path.basename(track.filename));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Arquivo não encontrado." });

  track.downloads += 1;
  writeTracks(tracks);
  res.download(filePath, `${track.title}.${track.format.toLowerCase()}`);
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || "Erro no servidor." });
});

app.listen(PORT, () => {
  console.log(`Easy Jukebox API rodando na porta ${PORT}`);
});
