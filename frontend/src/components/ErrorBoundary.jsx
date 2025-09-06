import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Dancing Script', cursive" }}>
              Something went wrong
            </h1>
            <p className="mt-4 text-lg">Please try again later or contact support.</p>
            <p className="mt-2 text-sm text-red-500">Error: {this.state.error?.message}</p>
            <button
              className="mt-6 px-4 py-2 bg-gradient-to-r from-teal-400 to-purple-500 text-white rounded-lg hover:from-teal-500 hover:to-purple-600"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;