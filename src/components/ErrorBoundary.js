
import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, info: null };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    console.error('Boundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) return <div className="p-6">Something went wrong. Check the console for details.</div>;
    return this.props.children;
  }
}
