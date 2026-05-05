// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BackupSystem
 * @dev Secure storage of IPFS CIDs and File Hashes for integrity verification.
 */
contract BackupSystem {
    
    struct FileRecord {
        string cid;          // IPFS Content Identifier
        string fileHash;     // Original File SHA-256 Hash
        string fileName;     // Name of the file
        uint256 timestamp;   // Time of upload
        address owner;       // Uploader's wallet address
    }

    // Map user address to their array of files
    mapping(address => FileRecord[]) private userFiles;

    // Event emitted when a file is securely stored
    event FileStored(address indexed user, string cid, string fileHash, uint256 timestamp);

    /**
     * @dev Stores a new file record on the blockchain
     */
    function storeFile(string memory _cid, string memory _fileHash, string memory _fileName) public {
        FileRecord memory newFile = FileRecord({
            cid: _cid,
            fileHash: _fileHash,
            fileName: _fileName,
            timestamp: block.timestamp,
            owner: msg.sender
        });
        
        userFiles[msg.sender].push(newFile);
        
        emit FileStored(msg.sender, _cid, _fileHash, block.timestamp);
    }

    /**
     * @dev Retrieves all file records for the caller
     */
    function getUserFiles() public view returns (FileRecord[] memory) {
        return userFiles[msg.sender];
    }
}
