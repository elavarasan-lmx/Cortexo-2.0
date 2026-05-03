const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
    path: "/socket.io/",
    transports: ["websocket"],   // 🔥 DISABLE POLLING
    pingInterval: 25000,
    pingTimeout: 60000,
    serveClient: false,
    cookie: false,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ---------------- REDIS ----------------
const redis = new Redis({
    host: 'prod-cluster-001.78ozga.ng.0001.aps1.cache.amazonaws.com',
    port: 6379
});

const channels = [
    'updaterates',
    'maharajupdatecommodity', 'maharajupdaterpanel', 'maharajupdatenews', 'maharajupdatemarquee', 'maharajupdatelimit', 'maharajupdatebook',
    'wltradeupdate', 'oswltradeupdate', 'maharajupdateusertermination'
];

// Subscribe ONCE (GLOBAL)
channels.forEach(channel => {
    redis.subscribe(channel, err => {
        if (err) console.error("Redis subscribe error:", err);
    });
});

// ---------------- CLIENT TRACKING ----------------
const activeClients = new Map();

io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    activeClients.set(socket.id, {
        socket,
        subscriptions: new Set(),
        lastActivity: Date.now()
    });

    socket.onAny(() => {
        const client = activeClients.get(socket.id);
        if (client) client.lastActivity = Date.now();
    });

    socket.on("subscribe", channel => {
        if (!channels.includes(channel)) return;
        activeClients.get(socket.id).subscriptions.add(channel);
    });

    socket.on("disconnect", reason => {
        console.log("Client disconnected:", socket.id, reason);
        activeClients.delete(socket.id);
    });
});

// ---------------- REDIS MESSAGE HANDLER ----------------
redis.on("message", (channel, message) => {
    try {
        const parsed = JSON.parse(message);
        io.emit(`${channel}:${parsed.event}`, parsed.data);
    } catch (e) {
        console.error("Invalid Redis message:", e);
    }
});

// ---------------- IDLE CLEANUP (SAFE) ----------------
setInterval(() => {
    const now = Date.now();
    activeClients.forEach((client, id) => {
        if (now - client.lastActivity > 120000) { // 2 minutes
            console.log("Closing idle socket:", id);
            client.socket.disconnect(true);
            activeClients.delete(id);
        }
    });
}, 60000);

// ---------------- START SERVER ----------------
server.listen(7124, () => {
    console.log("Socket.IO listening on port 7124");
});
