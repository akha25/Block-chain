import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, HardDrive, Lock, ChevronRight, Moon, Sun } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';

// Dynamic Cyber-Themed Background
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-gray-50 dark:bg-brand-dark transition-colors duration-300">
    <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-secondary/20 blur-[150px]" />
    <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[150px]" />
  </div>
);

const Navbar = ({ isAuth, setIsAuth, theme, setTheme }) => {
  const navigate = useNavigate();
  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <Shield className="text-brand-primary h-8 w-8" />
        <span className="text-xl font-bold tracking-wider neon-text text-gray-900 dark:text-white">SecureChain</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>
        {isAuth ? (
          <button onClick={() => { setIsAuth(false); navigate('/'); }} className="px-5 py-2 border border-brand-primary text-brand-primary font-medium rounded-lg hover:bg-brand-primary/10 transition-colors">
            Disconnect
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-brand-primary text-brand-dark font-bold rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition-transform">
            Connect Vault
          </button>
        )}
      </div>
    </nav>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="text-5xl md:text-7xl font-bold mb-6"
      >
        Decentralized <span className="text-brand-primary neon-text">Backup</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} 
        className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg mb-10"
      >
        Military-grade AES-256 encryption. Immutable blockchain records. Decentralized IPFS storage. Zero-knowledge architecture means your data is truly yours.
      </motion.p>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-8 py-4 bg-brand-secondary rounded-full font-bold text-lg hover:shadow-[0_0_25px_rgba(0,51,255,0.7)] transition-all text-white">
          Initialize Vault <ChevronRight />
        </button>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full">
        {[
          { icon: Lock, title: "Zero Knowledge", desc: "Data is AES-256 encrypted before it even reaches the IPFS network." },
          { icon: HardDrive, title: "Decentralized", desc: "Stored permanently across global IPFS nodes via Pinata API." },
          { icon: Shield, title: "Immutable Integrity", desc: "Original file hashes are permanently logged on Ethereum contracts." }
        ].map((Feature, i) => (
          <motion.div key={i} whileHover={{ y: -10 }} className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center">
            <Feature.icon className="h-14 w-14 text-brand-primary mb-6 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{Feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{Feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Login = ({ setIsAuth }) => {
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask extension to use Web3 features.');
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setIsAuth(true);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center tracking-wide">Access Protocol</h2>
        <div className="space-y-6">
          <button onClick={connectWallet} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-orange-500/10 border border-orange-500/50 text-orange-400 hover:bg-orange-500/20 transition-all font-semibold">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Metamask" className="w-6 h-6"/>
            Connect Web3 Wallet
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR FALLBACK AUTH</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          
          <input type="text" placeholder="Username" className="w-full bg-gray-100 dark:bg-brand-dark/50 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary transition-colors" />
          <input type="password" placeholder="Password" className="w-full bg-gray-100 dark:bg-brand-dark/50 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary transition-colors" />
          
          <button onClick={() => { setIsAuth(true); navigate('/dashboard'); }} className="w-full py-4 bg-brand-primary text-brand-dark font-bold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] transition-transform">
            Authenticate
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <AnimatedBackground />
      <div className="min-h-screen text-gray-900 dark:text-white flex flex-col relative z-10 font-sans transition-colors duration-300">
        <Navbar isAuth={isAuth} setIsAuth={setIsAuth} theme={theme} setTheme={setTheme} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#10192B', color: '#fff', border: '1px solid #00f0ff' } }} />
    </BrowserRouter>
  );
}
