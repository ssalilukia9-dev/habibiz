import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let displayMessage = this.state.error?.message || 'Unknown mystical anomaly';
      let errorDetail = null;

      try {
        if (displayMessage.startsWith('{')) {
          const parsed = JSON.parse(displayMessage);
          if (parsed.error) {
            displayMessage = parsed.error;
            errorDetail = parsed;
          }
        }
      } catch (e) {
        // Not JSON, use original message
      }

      return (
        <div className="min-h-screen bg-[#0A0B10] flex items-center justify-center p-6 text-slate-200 font-sans">
          <div className="max-w-md w-full glass-panel-purple p-8 rounded-[2.5rem] border-brand-primary/20 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Circuit Breach</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                The spiritual sanctuary has encountered a fundamental synchronization error.
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-[10px] font-mono text-red-400/80 overflow-auto max-h-48 text-left space-y-2">
               <p className="font-bold border-b border-white/5 pb-2 text-white">Error Logs:</p>
               <p className="break-words">{displayMessage}</p>
               {errorDetail && (
                 <div className="pt-2 text-[8px] text-slate-500 uppercase leading-normal">
                   <p>Operation: {errorDetail.operationType}</p>
                   <p>Source: {errorDetail.path}</p>
                   {displayMessage.includes('index') && (
                     <p className="mt-2 text-amber-400 font-bold">Action Required: This specific query requires a composite index. Check the browser console (F12) for a direct link to create it in Firebase.</p>
                   )}
                 </div>
               )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-brand-primary text-brand-depth rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Reconnect Sanctuary
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Home size={14} /> Return to Axis
              </button>
            </div>
            
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              Habibi AI Core v1.3.5
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
