# 🛡️ SecureChain - Blockchain-Based Secure Backup & Recovery

## 🚀 Project Overview
A modern, decentralized, and highly secure file backup system designed for the future of web3. Users can upload, encrypt, and store files via a decentralized network (IPFS), while retaining metadata immutably on an Ethereum Smart Contract. 

### Core Features
- **Zero-Knowledge Architecture:** Files are AES-256 encrypted *before* they are sent to IPFS.
- **Decentralized Storage:** Utilizes Pinata API to pin files reliably to IPFS.
- **Blockchain Verification:** Smart contracts store the original file hashes. Downloaded files are compared against the blockchain to detect tampering.
- **Futuristic UI:** Glassmorphism, neon highlights, and framer-motion micro-animations.

---

## 🏗️ Architecture Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Ethers.js
- **Backend:** Node.js, Express, Multer, Crypto (AES-256-CBC)
- **Blockchain:** Solidity (Ethereum), MetaMask
- **Storage:** IPFS (via Pinata)

---

## 💻 Local Setup Instructions

### 1. Smart Contract Setup (Blockchain)
1. Navigate to `blockchain/contracts`.
2. Deploy `BackupSystem.sol` using [Remix IDE](https://remix.ethereum.org) or Hardhat.
3. Save the deployed contract address.

### 2. Backend Setup (Server)
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```
2. Rename `.env.example` to `.env` and fill in your Pinata credentials:
   - Get API keys from [Pinata Cloud](https://pinata.cloud).
3. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup (Client)
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   npm install
   ```
2. Rename `.env.example` to `.env` and add your deployed smart contract address.
3. Start the client:
   ```bash
   npm run dev
   ```

---

## 🌍 Deployment Guide

### Deploying Frontend to Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. **Important**: Set the Framework Preset to **Vite** and the Root Directory to `client`.
5. Add your Environment Variables (e.g., `VITE_CONTRACT_ADDRESS`).
6. Click **Deploy**.

### Deploying Backend to Render
1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Set the Root Directory to `server`.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `npm start`.
6. Add all environment variables from your `server/.env` file.
7. Click **Create Web Service**.

---
*Built for excellence. Defend your data.*
