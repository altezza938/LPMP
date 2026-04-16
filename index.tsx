import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryState { error: Error | null; }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('lpmit-toms-v2-data');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 720, margin: '40px auto' }}>
          <h1 style={{ color: '#b91c1c' }}>Something went wrong loading the app.</h1>
          <p style={{ color: '#374151' }}>
            This is usually caused by stale data saved in your browser from a previous version.
            Click the button below to clear it and reload.
          </p>
          <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, overflow: 'auto', fontSize: 12 }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={this.handleReset}
            style={{ marginTop: 12, padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            Clear saved data and reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);