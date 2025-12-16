import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, Settings, Database, Link as LinkIcon, AlertTriangle, CheckCircle2, FileSpreadsheet, Trash2 } from 'lucide-react';
import { fetchDriveData, extractFileId } from '../utils/driveLoader';
import { Subscription } from '../types';

interface GoogleDriveSyncProps {
  onDataLoaded: (data: Subscription[], source: 'LOCAL' | 'CLOUD') => void;
}

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isExcelMode, setIsExcelMode] = useState(false);

  // Initial Load from LocalStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('ktv_g_url');
    const savedMode = localStorage.getItem('ktv_g_mode') === 'true';
    if (savedUrl) {
      setFileUrl(savedUrl);
      setIsExcelMode(savedMode);
      setFileName("Link Cloud Salvato"); 
      setShowConfig(false); // Force config closed if link exists
    } else {
      setShowConfig(true); // Open config only if no link
    }
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFileUrl(val);
    if (val.includes('sd=true') || val.includes('.xlsx')) {
        setIsExcelMode(true);
    } else {
        setIsExcelMode(false);
    }
    setErrorMsg('');
  };

  const clearConfig = () => {
      localStorage.removeItem('ktv_g_url');
      setFileUrl('');
      setFileName('');
      setShowConfig(true);
  };

  const saveConfig = () => {
    if (!fileUrl.trim()) {
      setErrorMsg("Inserisci un Link valido.");
      return;
    }
    const id = extractFileId(fileUrl);
    if (!id) {
       setErrorMsg("Impossibile trovare l'ID del file nel link.");
       return;
    }

    localStorage.setItem('ktv_g_url', fileUrl.trim());
    localStorage.setItem('ktv_g_mode', String(isExcelMode));
    setShowConfig(false);
    setFileName("Link Cloud Salvato");
    handleSync(fileUrl.trim());
  };

  const handleSync = async (specificUrl?: string) => {
    const targetUrl = specificUrl || fileUrl;
    
    if (!extractFileId(targetUrl)) {
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = await fetchDriveData(targetUrl, isExcelMode);
      onDataLoaded(data, 'CLOUD');
      setLoading(false);
      setShowConfig(false);
    } catch (error: any) {
      console.error("Sync Error", error);
      setErrorMsg(error.message);
      setLoading(false);
      // Stay on card view but show error, let user decide to open settings
    }
  };

  if (showConfig || !fileUrl) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 h-full flex flex-col justify-center relative overflow-hidden group min-h-[300px]">
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

        <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2 relative z-10">
          <Settings className="w-5 h-5 text-cyan-400" /> Configurazione Cloud
        </h3>
        
        <div className="space-y-4 relative z-10">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> Incolla Link Google Drive
            </label>
            <input 
              type="text" 
              value={fileUrl} 
              onChange={handleUrlChange}
              className={`w-full bg-black/50 border rounded px-3 py-3 text-sm text-white outline-none font-mono placeholder-gray-600 transition-all ${errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500'}`}
              placeholder="https://docs.google.com/spreadsheets/..."
            />
            
            <div className="flex items-center gap-2 mt-2">
                <button 
                   onClick={() => setIsExcelMode(!isExcelMode)}
                   className={`text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1 ${isExcelMode ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-gray-800 border-gray-600 text-gray-400'}`}
                >
                    {isExcelMode ? <CheckCircle2 className="w-3 h-3"/> : <div className="w-3 h-3 rounded-full border border-gray-500" />}
                    Modalità Excel Caricato (.xlsx)
                </button>
            </div>

            {errorMsg && (
              <div className="flex flex-col gap-1 text-red-300 text-xs bg-red-950/30 p-3 rounded border border-red-500/20 mt-2">
                <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> Errore
                </div>
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="mt-2 p-3 bg-blue-950/30 border border-blue-500/20 rounded text-[11px] leading-relaxed text-blue-100/80">
              <p className="font-bold text-blue-300 mb-1">IMPORTANTE:</p>
              <ul className="list-disc pl-4 space-y-1 text-blue-200/70">
                 <li>Il file deve essere <strong>Google Sheet</strong> o <strong>Excel (.xlsx)</strong>.</li>
                 <li>Assicurati che la condivisione sia su: <strong>"Chiunque abbia il link"</strong>.</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={saveConfig}
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded font-bold text-white transition-all shadow-lg shadow-cyan-900/20 active:scale-95 text-xs tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-50"
          >
             {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
             {loading ? 'Connetti Cloud' : 'Salva e Connetti'}
          </button>
          
          {fileUrl && !showConfig && (
            <button onClick={() => setShowConfig(false)} className="w-full text-xs text-gray-500 hover:text-white py-2">Indietro</button>
          )}
        </div>
      </div>
    );
  }

  // View when Link is Saved but not loaded yet (or loaded via auto-sync)
  return (
    <div className="relative group perspective-1000 h-full">
      <div className="relative w-full h-full min-h-[300px] p-8 border border-cyan-500/20 rounded-2xl bg-cyan-950/10 backdrop-blur-sm hover:bg-cyan-950/20 transition-all duration-500 flex flex-col items-center justify-center gap-4 text-center">
        
        <div className="absolute top-4 right-4 z-20 flex gap-2">
             <button onClick={clearConfig} className="p-2 hover:bg-white/10 rounded-full text-red-500/50 hover:text-red-400 transition-colors" title="Rimuovi Link Salvato">
                <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => setShowConfig(true)} className="p-2 hover:bg-white/10 rounded-full text-cyan-500/50 hover:text-cyan-400 transition-colors" title="Modifica Link">
                <Settings className="w-4 h-4" />
            </button>
        </div>

        <div className="relative z-10 p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform duration-300">
          {loading ? <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" /> : <Cloud className="w-12 h-12 text-cyan-400" />}
        </div>
        
        <div className="relative z-10 w-full">
          <h3 className="text-xl font-display font-bold text-white mb-1 tracking-widest uppercase">Drive Connesso</h3>
          
          <div className="my-3 bg-green-500/10 border border-green-500/30 rounded px-3 py-1 inline-flex items-center gap-2 max-w-full animate-pulse">
            {isExcelMode ? <FileSpreadsheet className="w-3 h-3 text-green-400 shrink-0" /> : <Database className="w-3 h-3 text-cyan-400 shrink-0" />}
            <span className="text-xs text-green-200 font-bold truncate max-w-[150px]">LINK IN MEMORIA</span>
          </div>
          
          {errorMsg && <p className="text-[10px] text-red-400 mb-2 bg-red-950/50 p-1 rounded border border-red-500/20">{errorMsg}</p>}

          <button 
            onClick={() => handleSync()}
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Caricamento...' : 'Avvia Dashboard'}
          </button>
          
          <p className="text-[10px] text-gray-500 mt-2">
            Il link è salvato nel browser. Clicca per accedere.
          </p>
        </div>
      </div>
    </div>
  );
};