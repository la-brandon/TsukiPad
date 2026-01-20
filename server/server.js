const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises; // Use the 'fs' module to read/write to text files
const cors = require("cors");

const app = express();

// Define multer storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads"));
// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());


// API route to fetch all journal entries
app.get("/api/journal/all", async (req, res) => {
  try {
    const allEntries = await getAllJournalEntriesFromFile(); // Read data from the text file
    res.json(allEntries);
  } catch (error) {
    console.error("Error fetching all journal entries:", error);
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

// API route to get journal entry by date
app.get("/api/journal/:date", async (req, res) => {
  const date = req.params.date;
  try {
    const journalEntry = await getJournalEntryByDateFromFile(date); // Read data from the text file
    res.json(journalEntry);
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({ error: "Failed to fetch journal entry" });
  }
});

// API route to create a new journal entry
app.post("/api/journal", upload.array("photos"), async (req, res) => {
  const { date, title, time, text, color } = req.body;
  const photoFiles = Array.isArray(req.files) ? req.files : [];
  try {
    await createJournalEntryInFile(date, title, time, text, color, photoFiles); // Write data to the text file
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ error: "Failed to create journal entry" });
  }
});

// API route to get calendar data for the current week
app.get("/api/calendar/week", async (req, res) => {
  try {
    const entries = await getAllJournalEntriesFromFile();

    const today = new Date();

    // Start week on Sunday (matches JS getDay)
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const thisWeek = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate < endOfWeek;
    });

    res.json(thisWeek);
  } catch (error) {
    console.error("Error fetching weekly calendar:", error);
    res.status(500).json({ error: "Failed to fetch weekly calendar" });
  }
});

// API route to edit an entry
app.put('/api/journal/entry/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const { title, time, text } = req.body;

    if (Number.isNaN(index)) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    const entries = await getAllJournalEntriesFromFile();

    if (index < 0 || index >= entries.length) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const entry = entries[index];

    // Update fields but keep others (like photos, date)
    entries[index] = {
      ...entry,
      title: title ?? entry.title,
      time: time ?? entry.time,
      text: text ?? entry.text,
    };

    await fs.writeFile('journal_data.txt', JSON.stringify(entries, null, 2));

    res.json(entries[index]);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// API route to delete entry
app.delete('/api/journal/entry/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);

    if (Number.isNaN(index)) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    const entries = await getAllJournalEntriesFromFile();

    if (index < 0 || index >= entries.length) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    entries.splice(index, 1);

    await fs.writeFile('journal_data.txt', JSON.stringify(entries, null, 2));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});


// Function to read all journal entries from the text file
async function getAllJournalEntriesFromFile() {
  try {
    const data = await fs.readFile("journal_data.txt", "utf-8");
    return JSON.parse(data) || [];
  } catch (error) {
    throw error;
  }
}

// Function to read a journal entry by date from the text file
async function getJournalEntryByDateFromFile(date) {
  try {
    const data = await fs.readFile("journal_data.txt", "utf-8");
    const entries = JSON.parse(data) || [];
    return entries.find((entry) => entry.date === date) || null;
  } catch (error) {
    throw error;
  }
}

// Function to create a new journal entry and write it to the text file
async function createJournalEntryInFile(date, title, time, text, color, photoFiles) {
  try {
    const existingEntries = await getAllJournalEntriesFromFile();
    const photoReferences = [];

    // Save each photo as a separate file and store its reference
    const files = Array.isArray(photoFiles) ? photoFiles : [];

    await Promise.all(
      files.map(async (file) => {
        const uniqueFileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(__dirname, "uploads", uniqueFileName);
        await fs.rename(file.path, filePath);
        photoReferences.push(`/uploads/${uniqueFileName}`);
      })
    );

    const newEntry = { date, title, time, text, color: color || "blue", photos: photoReferences };
    existingEntries.push(newEntry);

    await fs.writeFile(
      "journal_data.txt",
      JSON.stringify(existingEntries, null, 2)
    );
  } catch (error) {
    throw error;
  }
}

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
