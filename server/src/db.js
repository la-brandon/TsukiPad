require("dotenv/config");

const path = require("path");
const { pathToFileURL } = require("url");
const { PrismaClient } = require("@prisma/client");

// CJS/ESM interop-safe load
const libsqlMod = require("@prisma/adapter-libsql");
const PrismaLibSQL =
    libsqlMod.PrismaLibSQL ||
    libsqlMod.PrismaLibSql ||
    libsqlMod.default ||
    libsqlMod;

function resolveDbUrl() {
    const raw = process.env.DATABASE_URL;
    if (!raw) throw new Error("DATABASE_URL is missing in server/.env");

    // If you use file:./prisma/dev.db, make it absolute (Windows-safe)
    if (raw.startsWith("file:./")) {
        const rel = raw.slice("file:./".length); // prisma/dev.db
        const abs = path.resolve(process.cwd(), rel); // from server/
        return pathToFileURL(abs).toString(); // file:///C:/...
    }

    return raw;
}

const adapter = new PrismaLibSQL({ url: resolveDbUrl() }); // ✅ matches common adapter usage :contentReference[oaicite:2]{index=2}
const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
