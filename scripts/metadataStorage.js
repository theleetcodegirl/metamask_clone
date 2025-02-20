const fs = require("fs");
const path = require("path");

const METADATA_FILE = path.join(__dirname, "metadata.json");

// Load existing metadata
function loadMetadata() {
    if (fs.existsSync(METADATA_FILE)) {
        return JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
    }
    return {};
}

// Save metadata to JSON
function saveMetadata(transactionHash, ipfsUrl, amount, payee) {
    const metadata = loadMetadata();
    metadata[transactionHash] = { ipfsUrl, amount, payee, timestamp: new Date().toISOString() };
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf-8");
    console.log("✅ Metadata saved!");
}

// Retrieve metadata by transaction hash
function getMetadata(transactionHash) {
    return loadMetadata()[transactionHash] || null;
}

module.exports = { saveMetadata, getMetadata };
