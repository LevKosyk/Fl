import { useState, useRef, memo, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const VideoScreen = memo(({ src, onFinish }) => {
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const handleError = () => {
    setError(true);
    console.error('Error loading video:', src);
  };

  const handleEnded = () => {
    if (onFinish) onFinish();
  };

  // Check fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Automatically enter fullscreen when component mounts
  useEffect(() => {
    const enterFullscreen = () => {
      if (!containerRef.current) return;

      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(enterFullscreen, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className="position-fixed top-0 start-0 w-100 h-100 bg-black d-flex align-items-center justify-content-center" style={{ zIndex: 9999 }}>
      {error ? (
        <div className="text-center text-white p-4">
          <div className="display-1 mb-3">⚠️</div>
          <h2 className="mb-3">Ошибка загрузки видео</h2>
          <p className="mb-4 lead">Не удалось загрузить видеофайл.</p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={onFinish}
          >
            Закрыть
          </Button>
        </div>
      ) : (
        <div className="w-100 h-100 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center p-3 bg-dark bg-opacity-50">
            <h2 className="text-white mb-0">Специальный сюрприз</h2>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-light" 
                onClick={toggleFullscreen}
                className="d-flex align-items-center"
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
              <Button 
                variant="outline-light" 
                onClick={onFinish}
                className="btn-close btn-close-white"
              >
              </Button>
            </div>
          </div>
          <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3" style={{ height: 'calc(100% - 56px)' }}>
            <video
              ref={videoRef}
              src={src}
              autoPlay
              playsInline
              controls
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
              onEnded={handleEnded}
              onError={handleError}
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoScreen;