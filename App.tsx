import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/common/ThemeProvider';
import { LandingPage } from './components/pages/LandingPage';
import { StudioPage } from './components/pages/StudioPage';
import { LipsyncPage } from './components/pages/LipsyncPage';
import { ImagePage } from './components/pages/ImagePage';
import { AppsPage } from './components/pages/AppsPage';
import { WorkflowPage } from './components/pages/WorkflowPage';
import LoginPage from './app/login/page';

// Simple Error Boundary to catch crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-4">Please check the console for more details.</p>
          <pre className="text-left bg-white p-4 rounded border border-red-200 overflow-auto max-w-2xl text-sm">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/studio/apps" element={<AppsPage />} />
            <Route path="/studio/lipsync" element={<LipsyncPage />} />
            <Route path="/studio/image" element={<ImagePage />} />
            <Route path="/studio/workflow" element={<WorkflowPage />} />
            {/* Redirect old dashboard routes to studio */}
            <Route path="/dashboard" element={<Navigate to="/studio" replace />} />
            <Route path="/dashboard/lipsync" element={<Navigate to="/studio/lipsync" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/studio" replace />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
