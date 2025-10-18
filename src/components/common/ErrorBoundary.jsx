import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props){
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(){ return { hasError: true }; }
  componentDidCatch(error, info){
    // Log to your telemetry if available
    console.error('[ErrorBoundary]', error, info);
  }
  render(){
    if (this.state.hasError) {
      return <div role="alert" className="p-4 bg-red-50 text-red-800 rounded">Something went wrong. Please refresh or try another date.</div>;
    }
    return this.props.children;
  }
}