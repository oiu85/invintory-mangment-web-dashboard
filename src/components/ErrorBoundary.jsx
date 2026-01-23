import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <Card variant="elevated" className="max-w-2xl w-full">
            <Card.Body>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-error-100 dark:bg-error-900/30 p-3 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-error-600 dark:text-error-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Something went wrong
                  </h1>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    An unexpected error occurred. Please try refreshing the page.
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Card variant="outlined" className="mb-6">
                  <Card.Body>
                    <p className="text-sm font-mono text-error-600 dark:text-error-400 break-all">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-4">
                        <summary className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
                          Stack trace
                        </summary>
                        <pre className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 overflow-auto max-h-64">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </Card.Body>
                </Card>
              )}

              <Button onClick={this.handleReset} icon={RefreshCw} iconPosition="left" size="lg">
                Refresh Page
              </Button>
            </Card.Body>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
