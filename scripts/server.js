const express = require("express");
const cors = require("cors");
const { getMetadata } = require("./metadataStorage");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/metadata/:txHash", (req, res) => {
    const metadata = getMetadata(req.params.txHash);
    if (metadata) res.json(metadata);
    else res.status(404).json({ error: "Metadata not found" });
});

app.listen(5000, () => console.log("✅ API running at http://localhost:5000"));
