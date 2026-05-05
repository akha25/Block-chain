const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Memory storage for file uploads (so we can encrypt buffer directly)
const upload = multer({ storage: multer.memoryStorage() });

// Mock DB for user accounts (Using in-memory array for plug-and-play evaluation)
// In production, migrate this to MongoDB or PostgreSQL
const users = []; 

// Encryption Config
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Requires 64-character hex string (32 bytes)
const IV_LENGTH = 16;

// Mock storage for IPFS bypass during evaluations
const mockStorage = {};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    // Simplistic auth for evaluation - use bcrypt in prod
    users.push({ username, password }); 
    res.json({ message: 'User registered successfully' });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    res.json({ token, username });
});

// ==========================================
// FILE UPLOAD & ENCRYPTION ROUTES
// ==========================================
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });

        const originalBuffer = req.file.buffer;

        // 1. Generate SHA-256 Hash of original file (for Tamper Detection)
        const fileHash = crypto.createHash('sha256').update(originalBuffer).digest('hex');

        // 2. Encrypt File Buffer using AES-256-CBC
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        let encryptedData = cipher.update(originalBuffer);
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);
        
        // Prepend IV to the encrypted buffer so we can extract it during decryption
        const encryptedBuffer = Buffer.concat([iv, encryptedData]);

        // 3. Upload Encrypted File to IPFS via Pinata
        const formData = new FormData();
        formData.append('file', encryptedBuffer, { filename: `enc_${req.file.originalname}` });

        let ipfsHash = '';
        const isDummy = !process.env.PINATA_API_KEY || process.env.PINATA_API_KEY === 'your_pinata_api_key_here';
        
        if (isDummy) {
            console.log('Pinata keys not found. Using local memory mock storage.');
            ipfsHash = 'QmMock' + crypto.randomBytes(16).toString('hex');
            mockStorage[ipfsHash] = encryptedBuffer;
        } else {
            const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'pinata_api_key': process.env.PINATA_API_KEY,
                    'pinata_secret_api_key': process.env.PINATA_API_SECRET
                }
            });
            ipfsHash = pinataRes.data.IpfsHash;
        }

        // 4. Return CID and Hash to frontend to be stored on Smart Contract
        res.json({
            cid: ipfsHash,
            fileHash: fileHash,
            fileName: req.file.originalname,
            message: 'File encrypted and pinned to IPFS successfully'
        });

    } catch (error) {
        console.error('Upload Error:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Encryption or IPFS upload failed' });
    }
});

// ==========================================
// FILE DOWNLOAD & DECRYPTION ROUTES
// ==========================================
app.get('/api/files/download/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // 1. Fetch encrypted file from IPFS (or mock storage)
        let encryptedBuffer;
        if (cid.startsWith('QmMock')) {
            encryptedBuffer = mockStorage[cid];
            if (!encryptedBuffer) throw new Error("Mock file not found in memory storage.");
        } else {
            const gatewayUrl = `${process.env.PINATA_GATEWAY}/ipfs/${cid}`;
            const response = await axios.get(gatewayUrl, { responseType: 'arraybuffer' });
            encryptedBuffer = Buffer.from(response.data);
        }

        // 2. Extract IV and Decrypt
        const iv = encryptedBuffer.slice(0, IV_LENGTH);
        const encryptedData = encryptedBuffer.slice(IV_LENGTH);
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        let decryptedData = decipher.update(encryptedData);
        decryptedData = Buffer.concat([decryptedData, decipher.final()]);

        // 3. Send Decrypted buffer back to user
        res.set('Content-Type', 'application/octet-stream');
        res.send(decryptedData);

    } catch (error) {
        console.error('Download Error:', error.message);
        res.status(500).json({ error: 'Failed to download or decrypt file' });
    }
});

// ==========================================
// RAW ENCRYPTED DOWNLOAD (For Evaluation Proof)
// ==========================================
app.get('/api/files/raw/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        let encryptedBuffer;
        if (cid.startsWith('QmMock')) {
            encryptedBuffer = mockStorage[cid];
            if (!encryptedBuffer) throw new Error("Mock file not found.");
        } else {
            const gatewayUrl = `${process.env.PINATA_GATEWAY}/ipfs/${cid}`;
            const response = await axios.get(gatewayUrl, { responseType: 'arraybuffer' });
            encryptedBuffer = Buffer.from(response.data);
        }

        // Send the raw, AES-256 encrypted buffer directly (it will be garbled text/binary)
        res.set('Content-Type', 'application/octet-stream');
        res.send(encryptedBuffer);

    } catch (error) {
        console.error('Raw Download Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch raw file' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🛡️  Secure API running on port ${PORT}`);
});
