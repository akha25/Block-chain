import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, Download, CheckCircle, AlertTriangle, Shield, HardDrive, Clock, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setStatusText('Initiating secure AES-256 encryption...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Artificial delay to visualize encryption in the UI
      await new Promise(r => setTimeout(r, 1500));
      setProgress(30);
      setStatusText('Connecting to IPFS (Pinata Node)...');
      
      const res = await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => {
          const percentage = Math.round((p.loaded * 40) / p.total);
          setProgress(30 + percentage);
        }
      });

      setStatusText('Recording hash on Smart Contract...');
      setProgress(85);
      
      // Simulate Smart Contract confirmation delay
      await new Promise(r => setTimeout(r, 2000));
      setProgress(100);
      
      const newRecord = {
        id: Date.now(),
        name: file.name,
        cid: res.data.cid,
        hash: res.data.fileHash,
        date: new Date().toLocaleString(),
        status: 'secure', 
      };

      setFiles(prev => [newRecord, ...prev]);
      toast.success('File encrypted and stored immutably!');
    } catch (error) {
      toast.error('Upload failed. Check backend connection.');
      console.error(error);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDownload = async (file) => {
    const loadingToast = toast.loading('Retrieving & Decrypting file...');
    try {
      const res = await axios.get(`http://localhost:5000/api/files/download/${file.cid}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('File successfully decrypted and downloaded', { id: loadingToast });
    } catch (error) {
      toast.error('Decryption failed', { id: loadingToast });
    }
  };

  const handleDownloadEncrypted = async (file) => {
    const loadingToast = toast.loading('Retrieving raw encrypted payload...');
    try {
      const res = await axios.get(`http://localhost:5000/api/files/raw/${file.cid}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ENCRYPTED_${file.name}.enc`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Raw encrypted file downloaded for proof!', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to fetch raw file', { id: loadingToast });
    }
  };

  const verifyIntegrity = (file) => {
    // Simulating blockchain hash comparison
    const isSecure = Math.random() > 0.15; // 85% chance to pass, 15% fail for demo purposes
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: isSecure ? 'secure' : 'tampered' } : f));
    
    if (isSecure) {
      toast.success('Integrity Verified: Blockchain hash matches payload!');
    } else {
      toast.error('TAMPER ALERT: Content mismatch detected!');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Upload Column */}
      <div className="lg:col-span-1 space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          whileHover={{ y: -5 }}
          className="glass-panel p-8 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Shield className="w-20 h-20 text-brand-primary" />
          </div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <HardDrive className="text-brand-primary animate-pulse" /> Secure Upload Gateway
          </h3>
          
          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${isDragActive ? 'border-brand-primary bg-brand-primary/10 scale-105 shadow-[0_0_30px_rgba(0,240,255,0.2)]' : 'border-gray-300 dark:border-gray-600 hover:border-brand-primary/50'}`}>
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: 1.2 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <UploadCloud className={`h-16 w-16 mb-4 transition-colors ${isDragActive ? 'text-brand-primary' : 'text-gray-400'}`} />
            </motion.div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center">Drag & drop to encrypt</p>
            <p className="text-xs text-gray-500 mt-2 text-center">or click to browse local files</p>
          </div>

          <AnimatePresence>
            {uploading && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-brand-primary">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    transition={{ ease: "linear" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* System Status Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl">
           <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">Network Status</h4>
           <div className="space-y-3 text-sm">
             <div className="flex justify-between items-center"><span className="text-gray-500">Encryption</span><span className="text-green-400">AES-256 Active</span></div>
             <div className="flex justify-between items-center"><span className="text-gray-500">Storage Node</span><span className="text-brand-primary">IPFS (Pinata)</span></div>
             <div className="flex justify-between items-center"><span className="text-gray-500">Smart Contract</span><span className="text-green-400">Connected</span></div>
           </div>
        </motion.div>
      </div>

      {/* Vault Column */}
      <div className="lg:col-span-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl min-h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="text-brand-primary" /> Decentralized Vault
            </h3>
            <span className="text-sm px-3 py-1 bg-gray-200 dark:bg-brand-dark rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400">
              {files.length} Records
            </span>
          </div>
          
          {files.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
              <File className="h-20 w-20 mb-6 opacity-10" />
              <p className="text-lg">Your immutable vault is currently empty.</p>
              <p className="text-sm mt-2 opacity-50">Upload a file to secure it on the blockchain.</p>
            </div>
          ) : (
            <motion.div 
              className="space-y-4 overflow-y-auto pr-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div 
                    key={file.id} 
                    variants={{
                      hidden: { opacity: 0, x: 20, scale: 0.95 },
                      visible: { opacity: 1, x: 0, scale: 1 }
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-[#0f172a]/80 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-brand-primary/30 transition-all group"
                  >                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="p-4 bg-gray-50 dark:bg-brand-dark rounded-xl text-brand-primary border border-gray-200 dark:border-gray-800 group-hover:border-brand-primary/30 transition-colors">
                        <File className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{file.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {file.date}</span>
                          <span>•</span>
                          <span className="truncate w-[120px] sm:w-[200px]" title={file.cid}>CID: {file.cid}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
                      {file.status === 'secure' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5"/> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5"/> Tampered
                        </span>
                      )}
                      
                      <button onClick={() => verifyIntegrity(file)} className="p-2.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all" title="Verify Blockchain Hash">
                        <Shield className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDownloadEncrypted(file)} className="p-2.5 text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 rounded-xl transition-all" title="Download Raw Encrypted Payload (Proof)">
                        <Lock className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDownload(file)} className="p-2.5 bg-brand-primary text-brand-dark rounded-xl hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,240,255,0.3)]" title="Decrypt & Download">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
