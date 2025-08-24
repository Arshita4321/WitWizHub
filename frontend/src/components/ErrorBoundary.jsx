import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#2DD4BF] to-[#A855F7] flex items-center justify-center">
          <div className="bg-[#E5E7EB]/80 p-8 rounded-2xl shadow-2xl">
            <h1 className="text-2xl text-[#1E1B4B] font-bold">Oops! Something went wrong! 😔</h1>
            <p className="text-[#1E1B4B]">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#A855F7] text-[#E5E7EB] px-6 py-3 rounded-lg mt-4"
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