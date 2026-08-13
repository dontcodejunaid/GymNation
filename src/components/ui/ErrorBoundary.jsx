import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Gymnation App Runtime Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We encountered a temporary rendering error. Click below to refresh and reload your session.
            </p>
            {this.state.error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-left font-mono text-[11px] text-red-400 break-words max-h-32 overflow-y-auto">
                {String(this.state.error.message || this.state.error)}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold py-3 text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
