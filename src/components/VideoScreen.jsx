import { memo, useEffect, useRef, useState } from 'react';

const VideoScreen = memo(({ src, poster, title = 'Специальный сюрприз', onFinish }) => {
  const [status, setStatus] = useState('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    const request = document.fullscreenElement
      ? document.exitFullscreen?.()
      : (container.requestFullscreen?.() || container.webkitRequestFullscreen?.());

    request?.catch?.(() => {});
  };

  const handleClose = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    onFinish?.();
  };

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    setStatus('loading');
    video.load();
    video.play().catch(() => {});
  };

  return (
    <section ref={containerRef} className="video-screen" aria-label={title}>
      <header className="video-screen__header">
        <div>
          <span>НАША ВИДЕОГЛАВА</span>
          <h2>{title}</h2>
        </div>
        <div className="video-screen__actions">
          <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'}>
            {isFullscreen ? 'Свернуть' : 'На весь экран'}
          </button>
          <button type="button" className="video-screen__close" onClick={handleClose} aria-label="Закрыть видео">×</button>
        </div>
      </header>

      <div className="video-screen__stage">
        {status === 'error' ? (
          <div className="video-screen__message" role="alert">
            <span className="video-screen__message-mark">!</span>
            <h3>Видео не загрузилось</h3>
            <p>Проверь соединение и попробуй ещё раз.</p>
            <button type="button" onClick={retry}>Повторить</button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className={`video-screen__player ${status === 'ready' ? 'is-ready' : ''}`}
              autoPlay
              playsInline
              controls
              preload="metadata"
              poster={poster}
              onLoadStart={() => setStatus('loading')}
              onWaiting={() => setStatus('loading')}
              onCanPlay={() => setStatus('ready')}
              onPlaying={() => setStatus('ready')}
              onEnded={onFinish}
              onError={() => setStatus('error')}
            >
              <source src={src} type="video/mp4" />
              Ваш браузер не поддерживает воспроизведение видео.
            </video>

            {status === 'loading' && (
              <div className="video-screen__loading" role="status" aria-live="polite">
                <span className="video-loader" aria-hidden="true" />
                <strong>Подготавливаем воспоминание</strong>
                <small>Видео начнётся через мгновение</small>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
});

export default VideoScreen;
