require("dotenv/config");

const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const cors = require("cors");

const { prisma } = require("./src/db");
const authRouter = require("./src/routes/auth");

const app = express();
const PORT = 3000;

// Ensure uploads directory exists at startup
if (!fsSync.existsSync("uploads")) fsSync.mkdirSync("uploads");

// ---------- helpers ----------
function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function shapeEntry(e) {
  return {
    id: e.id,
    date: e.date,
    title: e.title,
    time: e.time,
    text: e.text,
    color: e.color,
    photos: (e.photos ?? []).map((p) => p.path),
  };
}

async function ensureUploadsDir() {
  if (!fsSync.existsSync("uploads")) fsSync.mkdirSync("uploads");
}

// ---------- middleware ----------
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.use("/auth", authRouter);

// ---------- uploads (multer) ----------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// ---------- routes ----------
app.get("/api/journal/all", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const entries = await prisma.entry.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { photos: true },
    });

    res.json(entries.map(shapeEntry));
  } catch (error) {
    console.error("Error fetching all journal entries:", error);
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

app.get("/api/journal/:date", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const date = req.params.date;

    const entries = await prisma.entry.findMany({
      where: { userId, date },
      orderBy: [{ time: "asc" }, { createdAt: "asc" }],
      include: { photos: true },
    });

    res.json(entries.map(shapeEntry));
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({ error: "Failed to fetch journal entry" });
  }
});

app.post("/api/journal", requireAuth, upload.array("photos"), async (req, res) => {
  try {
    const userId = req.session.userId;
    const { date, title, time, text, color } = req.body;
    const photoFiles = Array.isArray(req.files) ? req.files : [];

    if (!date || !title) {
      return res.status(400).json({ error: "date and title are required" });
    }

    await ensureUploadsDir();

    // Move uploaded files into /uploads and record paths
    const photoPaths = [];
    await Promise.all(
      photoFiles.map(async (file) => {
        const uniqueFileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(__dirname, "uploads", uniqueFileName);
        await fs.rename(file.path, filePath);
        photoPaths.push(`/uploads/${uniqueFileName}`);
      })
    );

    const created = await prisma.entry.create({
      data: {
        userId,
        date,
        title,
        time: time || null,
        text: text || null,
        color: color || "blue",
        photos: {
          create: photoPaths.map((p) => ({ path: p })),
        },
      },
      include: { photos: true },
    });

    res.json({ success: true, entry: shapeEntry(created) });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ error: "Failed to create journal entry" });
  }
});

app.put("/api/journal/entry/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { title, time, text, color } = req.body ?? {};

    // Only allow updating known fields
    const data = {
      ...(title !== undefined ? { title } : {}),
      ...(time !== undefined ? { time: time || null } : {}),
      ...(text !== undefined ? { text: text || null } : {}),
      ...(color !== undefined ? { color } : {}),
    };

    const existing = await prisma.entry.findFirst({
      where: { id, userId },
    });

    if (!existing) return res.status(404).json({ error: "Entry not found" });

    const updated = await prisma.entry.update({
      where: { id },
      data,
      include: { photos: true },
    });

    res.json({ success: true, entry: shapeEntry(updated) });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    res.status(500).json({ error: "Failed to update journal entry" });
  }
});

app.delete("/api/journal/entry/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const existing = await prisma.entry.findFirst({
      where: { id, userId },
      include: { photos: true },
    });

    if (!existing) return res.status(404).json({ error: "Entry not found" });

    // OPTIONAL: remove files from disk too
    // (DB will cascade-delete Photo rows, but files remain unless you delete them)
    await Promise.all(
      (existing.photos ?? []).map(async (p) => {
        // p.path looks like "/uploads/filename"
        const filename = p.path.replace("/uploads/", "");
        const filepath = path.join(__dirname, "uploads", filename);
        try {
          await fs.unlink(filepath);
        } catch {
          // ignore missing file
        }
      })
    );

    await prisma.entry.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    res.status(500).json({ error: "Failed to delete journal entry" });
  }
});


app.get("/api/calendar/week", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Fetch user entries and filter to week
    const entries = await prisma.entry.findMany({
      where: { userId },
      include: { photos: true },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });

    const thisWeek = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate < endOfWeek;
    });

    res.json(thisWeek.map(shapeEntry));
  } catch (error) {
    console.error("Error fetching weekly calendar:", error);
    res.status(500).json({ error: "Failed to fetch weekly calendar" });
  }
});

// ---------- start ----------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
