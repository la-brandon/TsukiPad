const { Router } = require("express");
const bcrypt = require("bcrypt");
const { prisma } = require("../db");

const router = Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body ?? {};

    if (typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
    }
    if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const uname = username.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { username: uname } });
    if (existing) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { username: uname, passwordHash },
        select: { id: true, username: true, createdAt: true },
    });

    req.session.userId = user.id;
    return res.json({ user });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};

    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Invalid entry" });
    }

    const uname = username.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { username: uname } });

    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid username or password" });

    req.session.userId = user.id;

    return res.json({
        user: { id: user.id, username: user.username, createdAt: user.createdAt },
    });
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Failed to logout" });
        res.clearCookie("connect.sid");
        return res.json({ ok: true });
    });
});

router.get("/me", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.json({ user: null });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, createdAt: true },
    });

    return res.json({ user: user ?? null });
});

module.exports = router;
