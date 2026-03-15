"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Uncaught exceptional error handled by Boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-slate-900/50 border border-current/10 rounded-3xl p-6 text-center backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mb-4 border border-gold-500/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <ShieldAlert size={20} />
          </div>
          <h2 className="text-white font-display text-xl mb-2">Excepción Controlada</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            {this.props.fallbackMessage || "Ocurrió un error al cargar este módulo avanzado. La plataforma está segura y puede continuar su uso con normalidad."}
          </p>
          <button 
           onClick={() => this.setState({ hasError: false, error: null })}
           className="mt-6 px-4 py-2 border border-gold-500/30 text-gold-500 rounded-full text-xs uppercase tracking-widest hover:bg-gold-500/10 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
