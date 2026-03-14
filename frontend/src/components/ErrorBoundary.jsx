import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" style={{ 
          padding: '40px', 
          textAlign: 'center', 
          background: 'var(--bg-light)', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <h1 style={{ color: 'var(--primary)' }}>Something went wrong</h1>
          <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>
            The application encountered an unexpected error.
          </p>
          <pre style={{ 
            background: '#eee', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'left', 
            maxWidth: '100%', 
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
