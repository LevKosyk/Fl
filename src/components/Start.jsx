import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const SECRET = 'я тебя люблю';
const START_DATE = new Date('2023-02-14').getTime();
const TOGETHER_LINE_INDEX = 2;

const getTogetherSeconds = () => Math.max(0, Math.floor((Date.now() - START_DATE) / 1000));
const formatTogetherLine = (seconds) => `Мы вместе: ${seconds.toLocaleString('en-US')} секунд`;

const Start = memo(({ onSuccess }) => {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [togetherSeconds, setTogetherSeconds] = useState(getTogetherSeconds);

  const [displayedLine, setDisplayedLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [allLines, setAllLines] = useState([]); 

  const [consoleFade, setConsoleFade] = useState(false); 
  const [matrixFade, setMatrixFade] = useState(false); 

  const navigate = useNavigate();

  const [lines] = useState(() => [
    "Загрузка данных 2.0...",
    "Синхронизация чувств завершена 2.0 ...",
    formatTogetherLine(getTogetherSeconds()),
    "Сообщений в Telegram: 68 765",
    "Сказано «я тебя люблю»: ∞",
    "Совместных фото: хуй знает мне лень считать - дохуя",
    "Совместных поездок: 8",
    "Сказано «спокойной ночи»: 232",
    "Поцелуев (примерно): бесконечно",
    "Не срачек: оооо ну тут мы разойдемся по полнйой -10000001 - это только официальная статистика",
    "Продано наркотиков на сумму: 0 (жаль)",
    "И это уже наша история... ❤️",
  ]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTogetherSeconds(getTogetherSeconds());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w;
    let h;
    let fontSize;
    let drops;
    const chars = 'ятебялюблю';
    let animationFrameId;
    let lastFrame = 0;
    const frameInterval = 1000 / 24;

    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      fontSize = Math.max(12, Math.floor(Math.min(w, h) / 60));
      drops = new Array(Math.ceil(w / fontSize)).fill(0);
    };

    const draw = (timestamp) => {
      animationFrameId = requestAnimationFrame(draw);
      if (document.hidden || timestamp - lastFrame < frameInterval) return;
      lastFrame = timestamp;
      ctx.fillStyle = `rgba(0,0,0,0.06)`;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = `rgba(0,255,0,1)`; // всегда полная яркость, fade идёт через CSS
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    resizeCanvas();
    animationFrameId = requestAnimationFrame(draw);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    inputRef.current?.focus();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') {
      const v = (e.target.value || '').trim();
      if (!v) {
        setMsg('Пустой ввод.');
        return;
      }
      if (v.toLocaleLowerCase('ru-RU') === SECRET) {
        setMsg('Доступ разрешён');
        if (onSuccess) onSuccess();
        setLineIndex(0);
        setCharIndex(0);
        setDisplayedLine("");
        setAllLines([]);
        setConsoleFade(false);
        setMatrixFade(false);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 2) {
          setMsg('Неверный пароль. Подсказка: посмотри на задний фон. Что ты там видишь? Слово - ......');
        } else {
          setMsg('Неверный пароль');
        }
        e.target.value = '';
      }
    }
  }, [onSuccess, attempts]);

  useEffect(() => {
    if (msg !== 'Доступ разрешён') return;

    const timeoutIds = [];
    const schedule = (callback, delay) => {
      const id = window.setTimeout(callback, delay);
      timeoutIds.push(id);
      return id;
    };

    if (lineIndex < lines.length) {
      if (charIndex < lines[lineIndex].length) {
        schedule(() => {
          setDisplayedLine((prev) => prev + lines[lineIndex][charIndex]);
          setCharIndex(charIndex + 1);
        }, 50);
      } else {
        schedule(() => {
          setAllLines((prev) => [...prev, lines[lineIndex]]);
          setLineIndex(lineIndex + 1);
          setCharIndex(0);
          setDisplayedLine("");
        }, 500);
      }
    } else if (lineIndex === lines.length) {
      schedule(() => {
        // 1. Сначала исчезает консоль
        setConsoleFade(true);

        // 2. Потом исчезает матрица через CSS-opacity
        schedule(() => {
          setMatrixFade(true);
          
          // 3. После завершения анимации затемнения переходим на страницу /table
          schedule(() => {
            navigate('/table');
          }, 5000); // Соответствует времени перехода opacity 5s ease
        }, 3000); // ждём окончания затухания консоли
      }, 3000);
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [charIndex, lineIndex, lines, msg, navigate]);

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          transition: 'opacity 5s ease', // плавное затухание матрицы
          opacity: matrixFade ? 0 : 1,
        }}
      />
      <div 
        style={{ 
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          opacity: consoleFade ? 0 : 1,
          transition: 'opacity 3s ease' // плавное исчезновение консоли
        }}
      >
        <div style={{ maxWidth: 820, width: '100%', padding: 24, background: 'rgba(0,0,0,0.55)', borderRadius: 8 }}>
          <div style={{ color: '#6df06d', marginBottom: 12 }}>_secure_portal / access</div>
          <div style={{ background: 'rgba(0,0,0,0.7)', padding: 18, borderRadius: 6 }}>
            <div style={{ color: '#b7f7b7', marginBottom: 8 }}>Инициализация защищённого канала...</div>
            <div style={{ color: '#b7f7b7' }}>Введите пароль для продолжения:</div>
            <div style={{ display: 'flex', marginTop: 10 }}>
              <div style={{ color: '#7ff07f', marginRight: 8 }}>root@love:~$</div>
              <input
                ref={inputRef}
                onKeyDown={handleKey}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#cffff0',
                  fontFamily: 'monospace',
                  flex: 1,
                }}
              />
            </div>
            <div style={{ marginTop: 10, color: msg.includes('Невер') ? '#ff9a9a' : '#9aff9a' }}>{msg}</div>

            {msg === 'Доступ разрешён' && (
              <div
                style={{
                  marginTop: 20,
                  color: 'lime',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.4em',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {allLines.map((line, i) => (
                  <div key={i}>{i === TOGETHER_LINE_INDEX ? formatTogetherLine(togetherSeconds) : line}</div>
                ))}
                {displayedLine && <div>{displayedLine}<span className="animate-pulse">▋</span></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Start;
