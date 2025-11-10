import React from "react";

type EBState = { error?: Error };

class ErrorBoundary extends React.Component<React.PropsWithChildren, EBState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-red-500 p-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">App crashed</h1>
            <pre className="text-sm whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;   // <-- default export
