import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  
  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error" role="alert">
          <div className="app-error__card">
            <div className="app-error__icon" aria-hidden="true">⚠️</div>
            <h2>Что-то пошло не так</h2>
            <p>Произошла непредвиденная ошибка. Пожалуйста, перезагрузите страницу.</p>
            <button 
              onClick={() => window.location.reload()}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
