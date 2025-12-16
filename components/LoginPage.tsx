import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ChevronRight, ScanLine, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (isRegistering) {
        handleRegister();
      } else {
        handleLogin();
      }
    }, 800);
  };

  const handleRegister = () => {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('ERROR // DATI MANCANTI');
      setIsLoading(false);
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('ktv_users') || '[]');
    
    // Check esistenza utente (Case Insensitive)
    if (storedUsers.some((u: any) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      setError('ERROR // UTENTE GIÀ ESISTENTE');
      setIsLoading(false);
      return;
    }

    const newUser = { username: cleanUser, password: cleanPass };
    localStorage.setItem('ktv_users', JSON.stringify([...storedUsers, newUser]));
    
    setIsLoading(false);
    setIsRegistering(false);
    
    // NON resettiamo i campi, così l'utente può cliccare subito Login
    // setUsername(''); 
    // setPassword('');
    
    alert('IDENTITY VERIFIED // UTENTE CREATO. PREMI LOGIN PER ACCEDERE.');
  };

  const handleLogin = () => {
    const inputUser = username.trim();
    const inputPass = password.trim();

    const storedUsers = JSON.parse(localStorage.getItem('ktv_users') || '[]');
    
    // 1. Cerca Utenti Custom (Username Case Insensitive, Password Case Sensitive)
    const userFound = storedUsers.find((u: any) => 
      u.username.toLowerCase() === inputUser.toLowerCase() && 
      u.password === inputPass
    );
    
    // 2. Admin Default (Username Case Insensitive, Password flessibile per mobile)
    // Accetta 'admin' o 'Admin' come password per facilitare l'accesso da mobile
    const isDefaultAdmin = 
      inputUser.toLowerCase() === 'admin' && 
      (inputPass === 'admin' || inputPass === 'Admin');

    if (isDefaultAdmin || userFound) {
      onLogin();
    } else {
      setError('ACCESS DENIED // CREDENZIALI ERRATE');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setUsername('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 relative z-10">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)] relative overflow-hidden group transition-all duration-500">
          
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scan_2s_ease-in-out_infinite] opacity-50" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-950/50 border border-cyan-500/30 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] relative transition-all duration-300">
              <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping opacity-20"></div>
              {isRegistering ? (
                <UserPlus className="w-10 h-10 text-cyan-400" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-cyan-400" />
              )}
            </div>
            <h1 className="text-4xl font-display font-black text-white tracking-wider mb-1">
              KEVIN<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">TV</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-300/60 text-xs font-mono tracking-[0.3em] uppercase">
              {isRegistering ? (
                <><ScanLine className="w-3 h-3" /> New Identity Protocol</>
              ) : (
                <><Lock className="w-3 h-3" /> Secure Access</>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest ml-1">
                {isRegistering ? 'Nuovo ID Utente' : 'Identificativo Utente'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  spellCheck="false"
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg bg-black/40 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm font-mono transition-all"
                  placeholder={isRegistering ? "CREATE USERNAME" : "USERNAME"}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest ml-1">
                {isRegistering ? 'Nuovo Codice Accesso' : 'Codice Sicurezza'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect="off"
                  className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-lg bg-black/40 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm font-mono transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-cyan-400 transition-colors"
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-950/30 p-3 rounded border border-red-500/30 animate-pulse">
                <ScanLine className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 uppercase tracking-wider font-display ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <span className="animate-pulse">{isRegistering ? 'Creating Identity...' : 'Accessing Mainframe...'}</span>
              ) : (
                <>
                  {isRegistering ? 'REGISTRA UTENTE' : 'LOGIN'} <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <button 
              onClick={toggleMode}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-bold font-mono tracking-wider transition-colors flex items-center justify-center gap-2 mx-auto hover:underline decoration-cyan-500/50 underline-offset-4"
            >
              {isRegistering ? (
                 <> <ArrowLeft className="w-3 h-3" /> TORNA AL LOGIN </>
              ) : (
                 <> NON HAI ACCESSO? CREA UTENZA <UserPlus className="w-3 h-3" /> </>
              )}
            </button>
            
            {!isRegistering && (
                <p className="text-gray-700 text-[10px] font-mono mt-3">
                (Default: admin / admin)
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
