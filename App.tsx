import React, { useState, useMemo, useEffect } from 'react';
import { Background } from './components/Background';
import { FileUpload } from './components/FileUpload';
import { GoogleDriveSync } from './components/GoogleDriveSync';
import { SubscriptionCard } from './components/SubscriptionCard';
import { AIAdvisor } from './components/AIAdvisor';
import { LoginPage } from './components/LoginPage';
import { Subscription, SubscriptionStatus, DashboardStats } from './types';
import { RefreshCw, LayoutDashboard, ListFilter, LogOut, Cloud, AlertTriangle } from 'lucide-react';
import { fetchDriveData } from './utils/driveLoader';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filter, setFilter] = useState<SubscriptionStatus | 'ALL'>('ALL');
  const [sourceType, setSourceType] = useState<'LOCAL' | 'CLOUD'>('LOCAL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // 1. Session Persistence Check on Mount
  useEffect(() => {
    const session = localStorage.getItem('ktv_session');
    if (session === 'active') {
      setIsAuthenticated(true);
    }
  }, []);

  const stats: DashboardStats = useMemo(() => {
    return subscriptions.reduce((acc, sub) => ({
      totalActive: acc.totalActive + 1,
      expiredCount: acc.expiredCount + (sub.status === SubscriptionStatus.EXPIRED ? 1 : 0),
      urgentCount: acc.urgentCount + (sub.status === SubscriptionStatus.EXPIRING_SOON ? 1 : 0),
      warningCount: acc.warningCount + (sub.status === SubscriptionStatus.UPCOMING ? 1 : 0),
    }), { totalActive: 0, expiredCount: 0, urgentCount: 0, warningCount: 0 });
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'ALL') return subscriptions;
    return subscriptions.filter(s => s.status === filter);
  }, [subscriptions, filter]);

  const handleDataLoaded = (data: Subscription[], source: 'LOCAL' | 'CLOUD' = 'LOCAL') => {
    setSubscriptions(data);
    setSourceType(source);
    setSyncError(null);
  };

  const handleRefresh = () => {
    setSubscriptions([]);
    setFilter('ALL');
    setSyncError(null);
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('ktv_session', 'active');
    setIsAuthenticated(true);
  };

  const handleCloudRefresh = async () => {
    const url = localStorage.getItem('ktv_g_url');
    const isExcelMode = localStorage.getItem('ktv_g_mode') === 'true';
    if (!url) return;
    
    setIsSyncing(true);
    setSyncError(null);
    try {
        const data = await fetchDriveData(url, isExcelMode);
        setSubscriptions(data);
        setSourceType('CLOUD');
    } catch (e: any) {
        console.error("Auto-sync failed:", e);
        setSyncError(e.message || "Errore di connessione al Cloud");
    } finally {
        setIsSyncing(false);
    }
  };

  // 2. Auto-Sync Data when Authenticated
  useEffect(() => {
    if (isAuthenticated && subscriptions.length === 0) {
        const savedUrl = localStorage.getItem('ktv_g_url');
        if (savedUrl) {
            handleCloudRefresh();
        }
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('ktv_session');
    setIsAuthenticated(false);
    setSubscriptions([]);
    setFilter('ALL');
    setSyncError(null);
  };

  return (
    <div className="min-h-screen text-gray-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      <Background />

      {!isAuthenticated ? (
        <LoginPage onLogin={handleLoginSuccess} />
      ) : (
        <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                KEVIN<span className="text-white">TV</span>
              </h1>
              <p className="text-blue-300/60 font-mono tracking-widest text-sm mt-2">
                SYSTEM V.3.3 // PERMANENT LINK ACTIVE
              </p>
            </div>

            <div className="flex gap-4">
              {subscriptions.length > 0 ? (
                <>
                    {sourceType === 'CLOUD' && (
                        <button 
                            onClick={handleCloudRefresh}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-6 py-3 rounded-full border border-green-500/30 bg-green-950/20 text-green-400 hover:bg-green-900/40 hover:text-green-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all group active:scale-95"
                        >
                            <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                            <span className="font-display font-bold">{isSyncing ? 'UPDATING...' : 'AGGIORNA CLOUD'}</span>
                        </button>
                    )}
                    
                    <button 
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all group"
                    >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="font-display font-bold">CAMBIA FILE</span>
                    </button>
                </>
              ) : (
                 /* Mostra un loader se stiamo sincronizzando */
                 (isSyncing) && (
                    <div className="flex items-center gap-2 px-4 py-2 text-cyan-400 animate-pulse border border-cyan-500/20 rounded-full bg-cyan-950/20">
                        <Cloud className="w-4 h-4" />
                        <span className="text-sm font-mono">SINCRONIZZAZIONE AUTO...</span>
                    </div>
                 )
              )}
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-900/40 hover:text-red-200 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* SYNC ERROR DISPLAY - Shows if auto-load fails, instead of showing the upload form immediately */}
          {syncError && subscriptions.length === 0 && !isSyncing && (
             <div className="max-w-4xl mx-auto mb-8 animate-[fadeIn_0.5s_ease-out]">
                <div className="bg-red-950/40 border border-red-500/40 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                    <div>
                        <h3 className="text-xl font-bold text-red-200 mb-1">Errore Connessione Cloud</h3>
                        <p className="text-red-300/70 font-mono text-sm">{syncError}</p>
                    </div>
                    <button 
                        onClick={handleCloudRefresh}
                        className="px-6 py-2 bg-red-900/50 hover:bg-red-800/50 text-white rounded-lg border border-red-500/30 transition-all"
                    >
                        Riprova Connessione
                    </button>
                    <button 
                        onClick={() => { setSyncError(null); }}
                        className="text-xs text-red-400 hover:text-white underline"
                    >
                        Reimposta Link o Usa File Locale
                    </button>
                </div>
             </div>
          )}

          {/* Initial Upload State - Show only if not syncing, no subscriptions, and NO active error blocking view */}
          {subscriptions.length === 0 && !isSyncing && !syncError ? (
            <div className="max-w-4xl mx-auto mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1: Local File */}
                  <FileUpload onDataLoaded={handleDataLoaded} />
                  
                  {/* Option 2: Google Drive */}
                  <GoogleDriveSync onDataLoaded={handleDataLoaded} />
              </div>
            </div>
          ) : (
             /* Se stiamo sincronizzando ma non abbiamo ancora i dati */
             subscriptions.length === 0 && isSyncing ? (
                 <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Cloud className="w-16 h-16 text-cyan-500/50 mb-4" />
                    <p className="text-cyan-400 font-mono">ESTRAZIONE DATI DAL MAINFRAME...</p>
                 </div>
             ) : (
                // Only show dashboard if we have subscriptions (and not just an error state)
                subscriptions.length > 0 && (
                <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
                
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900/60 backdrop-blur border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Totale Utenti</h3>
                    <p className="text-3xl font-display font-bold text-white">{stats.totalActive}</p>
                    </div>
                    
                    <div className="bg-red-950/30 backdrop-blur border border-red-500/30 p-6 rounded-2xl">
                    <h3 className="text-red-400 text-sm font-bold uppercase tracking-wider mb-1">Scaduti</h3>
                    <p className="text-3xl font-display font-bold text-red-500">{stats.expiredCount}</p>
                    </div>

                    <div className="bg-orange-950/30 backdrop-blur border border-orange-500/30 p-6 rounded-2xl">
                    <h3 className="text-orange-400 text-sm font-bold uppercase tracking-wider mb-1">In Scadenza</h3>
                    <p className="text-3xl font-display font-bold text-orange-400">{stats.urgentCount}</p>
                    </div>

                    <div className="bg-yellow-900/30 backdrop-blur border border-yellow-500/30 p-6 rounded-2xl">
                    <h3 className="text-yellow-400 text-sm font-bold uppercase tracking-wider mb-1">Warning</h3>
                    <p className="text-3xl font-display font-bold text-yellow-400">{stats.warningCount}</p>
                    </div>
                </div>

                {/* AI Section */}
                <AIAdvisor subscriptions={subscriptions} />

                {/* Main Content Area */}
                <section>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                        <LayoutDashboard className="text-cyan-400" /> Database Clienti
                    </h2>
                    
                    {/* Filters */}
                    <div className="flex bg-gray-900/80 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
                        <button 
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                        Tutti
                        </button>
                        <button 
                        onClick={() => setFilter(SubscriptionStatus.EXPIRING_SOON)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === SubscriptionStatus.EXPIRING_SOON ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                        Urgenti
                        </button>
                        <button 
                        onClick={() => setFilter(SubscriptionStatus.EXPIRED)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === SubscriptionStatus.EXPIRED ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                        Scaduti
                        </button>
                    </div>
                    </div>

                    {filteredSubscriptions.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-white/5 border-dashed">
                        <ListFilter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">Nessun cliente trovato in questa categoria.</p>
                    </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSubscriptions.map((sub, idx) => (
                        <SubscriptionCard key={sub.id} data={sub} index={idx} />
                        ))}
                    </div>
                    )}
                </section>
                </div>
                )
             )
          )}
        </main>
      )}
    </div>
  );
};

export default App;