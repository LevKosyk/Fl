import React from 'react';

const Loading = () => {
  return (
    <div className="app-loading" role="status" aria-live="polite">
      <div className="app-loading__content">
        <div className="app-loading__spinner" aria-hidden="true" />
        <p>Загрузка...</p>
      </div>
    </div>
  );
};

export default Loading;
