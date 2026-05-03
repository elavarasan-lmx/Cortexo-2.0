const fs = require("fs");
const http = require("http");
const crypto = require("crypto");
const WebSocket = require("ws");

// ================= CONFIGURATION FOR Maharaj BULLION =================
const CONFIG = {
    PORT: 57124,
    FILE_PATH: "/var/www/html/maharaj/client/maharaj.txt",
    SECRET: "logiMax@916#socket",
    HEARTBEAT_INTERVAL: 30000,
    FILE_WATCH_DEBOUNCE: 50,
    INITIAL_SYNC_DELAY: 100,
};

// ================= TOKEN =================
const VALID_TOKEN = crypto.createHash("sha256")
    .update(CONFIG.SECRET)
    .digest("hex");

console.log("🔐 Valid Token:", VALID_TOKEN);
console.log("📋 Clients must use this token to connect!");

// ================= TRACKING =================
let connectionAttempts = 0;
let successfulConnections = 0;
let rejectedConnections = 0;

// ================= HTTP SERVER =================
const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        return res.end("OK");
    }

    if (req.url === "/stats") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
            clients: wss.clients.size,
            uptime: Math.floor(process.uptime()),
            stateSize: lastStateMap.size,
            lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : null,
            connectionAttempts,
            successfulConnections,
            rejectedConnections
        }));
    }

    if (req.url === "/token") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        return res.end(VALID_TOKEN);
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
});

// ================= WEBSOCKET SERVER =================
const wss = new WebSocket.Server({
    server,
    handleProtocols: (protocols) => {
        console.log("🔍 Connection attempt with protocols:", protocols);
        const list = Array.from(protocols);

        if (list.includes(VALID_TOKEN)) {
            console.log("✅ Valid token found");
            return VALID_TOKEN;
        }

        console.log("❌ Invalid token! Expected:", VALID_TOKEN.substring(0, 20) + "...");
        return false;
    },
    perMessageDeflate: true
});

// ================= STATE MANAGEMENT =================
let lastStateMap = new Map();
let lastUpdateTime = null;
let fileWatchDebounceTimer = null;

// ================= CONNECTION HANDLING =================
wss.on("connection", (ws, req) => {
    connectionAttempts++;

    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Validate protocol
    if (ws.protocol !== VALID_TOKEN) {
        rejectedConnections++;
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("❌ REJECTED CONNECTION");
        console.log("   IP:", clientIP);
        console.log("   Received protocol:", ws.protocol || "NONE");
        console.log("   Expected:", VALID_TOKEN.substring(0, 20) + "...");
        console.log("   Time:", new Date().toLocaleString());
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        ws.close(1008, "Policy Violation");
        return;
    }

    successfulConnections++;
    ws.isAlive = true;
    ws.connectedAt = Date.now();
    ws.clientIP = clientIP;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ CLIENT CONNECTED");
    console.log("   IP:", clientIP);
    console.log("   Time:", new Date().toLocaleString());
    console.log("   Total clients NOW:", wss.clients.size);
    console.log("   Connection attempts:", connectionAttempts);
    console.log("   Successful:", successfulConnections);
    console.log("   Rejected:", rejectedConnections);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Send initial state (triple-send strategy)
    if (lastStateMap.size > 0) {
        const fullStatePayload = Array.from(lastStateMap.values()).join("\n");
        safeSend(ws, "R");
        safeSend(ws, fullStatePayload);

        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
                safeSend(ws, `R\n${fullStatePayload}`);
            }
        }, CONFIG.INITIAL_SYNC_DELAY);
    }

    ws.on("message", (message) => {
        if (message.toString() === "ping") {
            safeSend(ws, "pong");
        }
    });

    ws.on("close", (code, reason) => {
        const duration = Math.floor((Date.now() - ws.connectedAt) / 1000);
        console.log("🔌 Client disconnected");
        console.log("   IP:", ws.clientIP);
        console.log("   Code:", code);
        console.log("   Duration:", duration, "seconds");
        console.log("   Remaining clients:", wss.clients.size);
    });

    ws.on("error", (error) => {
        console.error("⚠️ WebSocket error from", ws.clientIP, ":", error.message);
    });
});

// ================= HEARTBEAT =================
const heartbeatInterval = setInterval(() => {
    let deadConnections = 0;
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            deadConnections++;
            console.log("💀 Terminating dead connection from", ws.clientIP);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });

    if (deadConnections > 0) {
        console.log("🧹 Cleaned up", deadConnections, "dead connections");
    }
}, CONFIG.HEARTBEAT_INTERVAL);

wss.on("close", () => {
    clearInterval(heartbeatInterval);
});

// ================= BROADCAST HELPERS =================
function safeSend(ws, data) {
    try {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
            return true;
        }
    } catch (error) {
        console.error("⚠️ Send error:", error.message);
    }
    return false;
}

function broadcast(data) {
    let successCount = 0;
    wss.clients.forEach(client => {
        if (safeSend(client, data)) {
            successCount++;
        }
    });
    return successCount;
}

// ================= DATA PROCESSING =================
function processLine(line, lastStateMap) {
    const cols = line.split("\t");
    if (cols.length < 2) return null;

    const type = cols[0];
    const id = cols[1];
    const stateKey = `${type}|${id}`;

    let simplified = "";
    let fullState = "";

    switch (type) {
        case "1":
        case "2":
            return processRateData(type, id, cols, stateKey, lastStateMap);

        case "3":
            simplified = `3|${id}|${cols[3] || ""}|${cols[4] || ""}`;
            fullState = simplified;
            break;

        case "4":
            simplified = `4|${id}|${cols[3] || "1"}|${cols[4] || "0"}|${cols[5] || ""}`;
            fullState = simplified;
            break;

        default:
            simplified = cols.join("|");
            fullState = simplified;
    }

    return { stateKey, simplified, fullState };
}

function processRateData(type, id, cols, stateKey, lastStateMap) {
    let cleanId = id;

    if (type === "1") {
        const upperId = id.toUpperCase();
        if (upperId.includes("GOLD")) cleanId = "G";
        else if (upperId.includes("SILVER")) cleanId = "S";
        else if (upperId.includes("INR")) cleanId = "I";
    }

    const name = cols[2] || "";
    const bid = cols[3] || "";
    const ask = cols[4] || "";
    const high = cols[5] || "";
    const low = cols[6] || "";

    let fullState;
    if (type === "2") {
        fullState = `2|${name}|${bid}|${ask}|${high}|${low}`;
    } else {
        fullState = `1|${cleanId}|${bid}|${ask}|${high}|${low}`;
    }

    let simplified = fullState;
    const lastState = lastStateMap.get(stateKey);

    if (lastState) {
        const lastFields = lastState.split("|");
        const lastHigh = lastFields[4] || "";
        const lastLow = lastFields[5] || "";

        if (high === lastHigh && low === lastLow) {
            simplified = type === "2"
                ? `2|${name}|${bid}|${ask}`
                : `1|${cleanId}|${bid}|${ask}`;
        }
    }

    return { stateKey, simplified, fullState };
}

// ================= FILE READING & BROADCASTING =================
function broadcastRate() {
    fs.readFile(CONFIG.FILE_PATH, "utf8", (err, data) => {
        if (err) {
            console.error("❌ File read error:", err.message);
            return;
        }

        const lines = data.trim().split("\n");
        const changedLines = [];
        const newStateMap = new Map();

        for (let line of lines) {
            const result = processLine(line, lastStateMap);
            if (!result) continue;

            const { stateKey, simplified, fullState } = result;
            newStateMap.set(stateKey, fullState);

            if (lastStateMap.get(stateKey) !== fullState) {
                changedLines.push(simplified);
            }
        }

        const keysChanged = detectStateStructureChange(lastStateMap, newStateMap);

        if (keysChanged) {
            const fullPayload = Array.from(newStateMap.values()).join("\n");
            broadcast("R");
            const count = broadcast(fullPayload);
            console.log(`🧹 State reset (structure changed) → ${count} clients`);

            if (count === 0) {
                console.log("⚠️  WARNING: No clients connected! Updates are not being received.");
            }
        } else if (changedLines.length > 0) {
            const payload = changedLines.join("\n");
            const count = broadcast(payload);
            console.log(`📤 ${changedLines.length} updates → ${count} clients`);

            if (count === 0 && wss.clients.size === 0) {
                console.log("💤 No clients connected (updates ready for next connection)");
            }
        }

        lastStateMap = newStateMap;
        lastUpdateTime = Date.now();
    });
}

function detectStateStructureChange(oldMap, newMap) {
    if (oldMap.size !== newMap.size) return true;

    for (let key of oldMap.keys()) {
        if (!newMap.has(key)) return true;
    }

    for (let key of newMap.keys()) {
        if (!oldMap.has(key)) return true;
    }

    return false;
}

// ================= FILE WATCHING =================
let watcher = null;

function startFileWatch() {
    try {
        watcher = fs.watch(CONFIG.FILE_PATH, (eventType, filename) => {
            if (fileWatchDebounceTimer) {
                clearTimeout(fileWatchDebounceTimer);
            }

            fileWatchDebounceTimer = setTimeout(() => {
                broadcastRate();
            }, CONFIG.FILE_WATCH_DEBOUNCE);
        });

        watcher.on("error", (error) => {
            console.error("⚠️ File watcher error:", error.message);
            setTimeout(() => {
                console.log("🔄 Restarting file watcher...");
                startFileWatch();
            }, 5000);
        });

        console.log(`👁️  Watching file: ${CONFIG.FILE_PATH}`);
    } catch (error) {
        console.error("❌ Failed to start file watcher:", error.message);
    }
}

// ================= GRACEFUL SHUTDOWN =================
function gracefulShutdown(signal) {
    console.log(`\n⚠️  ${signal} received. Closing server gracefully...`);

    wss.close(() => {
        console.log("✅ WebSocket server closed");
    });

    if (watcher) {
        watcher.close();
        console.log("✅ File watcher closed");
    }

    server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ================= STARTUP =================
server.listen(CONFIG.PORT, "0.0.0.0", () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Maharaj BULLION WebSocket Server Started");
    console.log(`📍 Port: ${CONFIG.PORT}`);
    console.log(`📄 File: ${CONFIG.FILE_PATH}`);
    console.log(`🔐 Token: ${VALID_TOKEN}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📋 Connection URL: ws://YOUR_SERVER_IP:${CONFIG.PORT}`);
    console.log(`📋 Get token: curl http://localhost:${CONFIG.PORT}/token`);
    console.log(`📊 Get stats: curl http://localhost:${CONFIG.PORT}/stats`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⏳ Waiting for client connections...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    broadcastRate();
    startFileWatch();
});

// ================= ERROR HANDLING =================
process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
});
