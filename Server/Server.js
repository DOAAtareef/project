require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Web3 } = require("web3");

// Initialize Express App
const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Connect to Ethereum (Ganache)
const web3 = new Web3("HTTP://127.0.0.1:7545");
const contractAddress = "0x33451C398BCb50f291C549a84D12efDA511B7747";

// ABI for the smart contract
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "uint256", "name": "temperature", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "humidity", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "DataStored",
        "type": "event"
    },
    {
        "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
        "name": "readings",
        "outputs": [
            { "internalType": "uint256", "name": "temperature", "type": "uint256" },
            { "internalType": "uint256", "name": "humidity", "type": "uint256" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_temperature", "type": "uint256" },
            { "internalType": "uint256", "name": "_humidity", "type": "uint256" }
        ],
        "name": "storeData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getLatestReading",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const contract = new web3.eth.Contract(contractABI, contractAddress);
const account = "0x5Be1713499216dA60D31032338d884600F591688";

// API Endpoint to Store Data
app.post("/store-data", async (req, res) => {
    let { temperature, humidity } = req.body;

    // Validate and convert data
    if (temperature === undefined || humidity === undefined) {
        return res.status(400).json({ success: false, error: "Temperature or humidity missing" });
    }
    
    // Ensure values are numbers
    temperature = parseFloat(temperature);
    humidity = parseFloat(humidity);

    if (isNaN(temperature) || isNaN(humidity)) {
        return res.status(400).json({ success: false, error: "Invalid temperature or humidity value" });
    }

    // Convert float to integer format suitable for smart contract
    const scaledTemperature = Math.round(temperature * 10); // Convert to integer with 2 decimal places
    const scaledHumidity = Math.round(humidity * 10);

    try {
        // Ensure gasEstimate is a regular number
        const gasEstimate = await contract.methods.storeData(scaledTemperature, scaledHumidity).estimateGas({ from: account });
        
        // Convert gasEstimate to a regular number if it's a BigInt
        const gasLimit = Number(gasEstimate) * 2;  // Multiply by 2 for safety

        const tx = await contract.methods.storeData(scaledTemperature, scaledHumidity).send({ from: account, gas: gasLimit });

        res.json({ success: true, txHash: tx.transactionHash });
    } catch (error) {
        console.error("Error storing data:", error);
        res.status(500).json({ success: false, error: "Blockchain error while storing data" });
    }
});

// API Endpoint to Retrieve Latest Reading
app.get("/latest-reading", async (req, res) => {
    try {
        const data = await contract.methods.getLatestReading().call();

        // Ensure that you convert BigInt to a regular number
    res.json({
        temperature: (Number(data[0]) / 100).toFixed(2), // Convert BigInt to Number
        humidity: (Number(data[1]) / 100).toFixed(2),
        timestamp: new Date(Number(data[2]) * 1000).toISOString(),
    });

    } catch (error) {
        console.error("Error fetching latest reading:", error);
        res.status(500).json({ success: false, error: "Error fetching data from blockchain" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
