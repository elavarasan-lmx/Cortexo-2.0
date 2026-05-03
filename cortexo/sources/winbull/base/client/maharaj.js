const fs = require("fs");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");

const PORT = 57117;
const FILE_PATH = "/var/www/html/maharaj/client/maharaj.txt";

// ================= HTTP SERVER =================
const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200);
        res.end("OK");
        return;
    }
    res.writeHead(404);
    res.end();
});

// ================= SOCKET.IO =================
const io = new Server(server, {
    path: "/ratesocket/socket.io/",
    transports: ["websocket"],
    pingInterval: 25000,
    pingTimeout: 60000,
    // cors: { origin: "*" }
    cors: {
        origin: ["http://test.ganeshbullion.com"],  //  Allow ONLY your domain
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ================= TOKEN SECURITY =================
const SECRET = "logiMax@916#socket";
const VALID_TOKEN = crypto.createHash("sha256").update(SECRET).digest("hex");

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token || token !== VALID_TOKEN) {
        console.log(" Forbidden - Invalid Token:", token);
        return next(new Error("Forbidden"));
    }

    next();
});

// ================= SOCKET CONNECTION =================
let lastRate = null;

io.on("connection", (socket) => {
    console.log("Client connected:" + socket.id + " | Total: " + io.engine.clientsCount);

    if (lastRate) {
        socket.emit("rateUpdate", { rate: lastRate });
    }

    socket.on("disconnect", (reason) => {
        console.log("Client disconnected:" + socket.id + " | " + reason);
    });
});

let broadcastInterval = null;

// ---------------- READ & BROADCAST ----------------
function broadcastRate() {
    fs.readFile(FILE_PATH, "utf8", (err, data) => {
        if (err) {
            console.error("❌ Read error:", err.message);
            return;
        }

        const rate = data.trim();
        if (!rate) return;

        if (rate !== lastRate) {
            lastRate = rate;
            io.emit("rateUpdate", { rate });
            console.log(`📤 Rate Update: ${rate} | Clients: ${io.engine.clientsCount}`);
        }
    });
}

// ---------------- FILE WATCH (SAFE) ----------------
let watcher;
try {
    watcher = fs.watch(FILE_PATH, { persistent: true }, (eventType) => {
        if (eventType === "change") {
            broadcastRate();
        }
    });
} catch (err) {
    console.error("❌ File watch error:", err);
}

// ---------------- FALLBACK POLL ----------------
broadcastInterval = setInterval(broadcastRate, 800);

// ================= START SERVER =================
server.listen(PORT, "0.0.0.0", () => {
    console.log("Secure Socket.IO running on port " + PORT);
});