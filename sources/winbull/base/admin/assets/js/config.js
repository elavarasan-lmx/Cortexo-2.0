// Lightstreamer Configuration
// This file should be loaded from server-side configuration
// DO NOT commit actual credentials to version control

var LIGHTSTREAMER_CONFIG = {
    // These values should be loaded from server endpoint
    // Example: fetch('/api/get-lightstreamer-config')
    protocol: document.location.protocol !== "file:" ? document.location.protocol : "http:",
    host: "REPLACE_WITH_SERVER_CONFIG", // Replace with actual host from server
    port: document.location.protocol === "https:" ? "443" : "8080",
    adapter: "REPLACE_WITH_ADAPTER_NAME", // Replace with actual adapter name
    username: "REPLACE_WITH_USERNAME" // Replace with actual username from server
};

// Note: In production, load this configuration from a secure server endpoint
// Example implementation:
// fetch(base_url + 'api/get-lightstreamer-config')
//     .then(response => response.json())
//     .then(config => {
//         LIGHTSTREAMER_CONFIG = config;
//         // Initialize Lightstreamer client here
//     });
