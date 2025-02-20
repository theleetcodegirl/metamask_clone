require("dotenv").config();
const axios = require("axios");
const { saveMetadata } = require("./metadataStorage");

async function uploadMetadata(transactionHash, amount, payee) {
    const metadata = {
        name: "Payment Receipt",
        description: `Receipt for a payment of ${amount} PAY tokens to ${payee}`,
        transaction_hash: transactionHash,
        timestamp: new Date().toISOString(),
        image: "ipfs://bafkreigcjdburhwluhuaym6gha27lnusv5th2kp5i4gdjt5xyqmf26guqy"
    };

    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
        headers: { "Authorization": `Bearer ${process.env.PINATA_JWT}` }
    });

    const ipfsUrl = `ipfs://${res.data.IpfsHash}`;
    console.log("✅ Uploaded to IPFS:", ipfsUrl);

    // Save metadata locally
    saveMetadata(transactionHash, ipfsUrl, amount, payee);
    
    return ipfsUrl;
}

module.exports = { uploadMetadata };
