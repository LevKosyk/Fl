import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const Start = memo(({ onSuccess }) => {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const [msg, setMsg] = useState('');
  const SECRET = 'я тебя люблю';
  const [attempts, setAttempts] = useState(0);

  const [displayedLine, setDisplayedLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [allLines, setAllLines] = useState([]); 

  const [consoleFade, setConsoleFade] = useState(false); 
  const [matrixFade, setMatrixFade] = useState(false); 

  const navigate = useNavigate();

  const startDate = new Date("2023-02-14");
  const now = new Date();
  const secondsTogether = Math.floor((now - startDate) / 1000);

  const lines = useRef([
    "Загрузка данных...",
    "Синхронизация чувств завершена...",
    `Мы вместе: ${secondsTogether.toLocaleString()} секунд`,
    "Сообщений в Telegram: 33 567",
    "Сказано «я тебя люблю»: 276 раз",
    "Совместных фото: 2",
    "Совместных поездок: 2",
    "Сказано «спокойной ночи»: 98 раз",
    "Совместных фильмов просмотрено: 18",
    "Поцелуев (примерно): бесконечно ",
    "Не срачек: 1",
    "Продано наркотиков на сумму: 0",
    "И это только начало нашей истории... ❤️",
  ]).current;

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const chars = 'ятебялюблю';
    const fontSize = Math.max(12, Math.floor(Math.min(w, h) / 60));
    const columns = Math.floor(w / fontSize);
    const drops = new Array(columns).fill(0);

    let animationFrameId;

    const draw = () => {
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
      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);
    
    window.addEventListener('resize', handleResize);
    inputRef.current?.focus();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') {
      const v = (e.target.value || '').trim();
      if (!v) {
        setMsg('Пустой ввод.');
        return;
      }
      if (v === SECRET) {
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
  }, [SECRET, onSuccess, attempts]);

  useEffect(() => {
    if (msg !== 'Доступ разрешён') return;

    let timeoutId;

    if (lineIndex < lines.length) {
      if (charIndex < lines[lineIndex].length) {
        timeoutId = setTimeout(() => {
          setDisplayedLine((prev) => prev + lines[lineIndex][charIndex]);
          setCharIndex(charIndex + 1);
        }, 50);
      } else {
        timeoutId = setTimeout(() => {
          setAllLines((prev) => [...prev, lines[lineIndex]]);
          setLineIndex(lineIndex + 1);
          setCharIndex(0);
          setDisplayedLine("");
        }, 500);
      }
    } else if (lineIndex === lines.length) {
      timeoutId = setTimeout(() => {
        // 1. Сначала исчезает консоль
        setConsoleFade(true);

        // 2. Потом исчезает матрица через CSS-opacity
        setTimeout(() => {
          setMatrixFade(true);
          
          // 3. После завершения анимации затемнения переходим на страницу /table
          setTimeout(() => {
            navigate('/table');
          }, 5000); // Соответствует времени перехода opacity 5s ease
        }, 3000); // ждём окончания затухания консоли
      }, 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [charIndex, lineIndex, lines.length, msg, navigate]);

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
                  <div key={i}>{line}</div>
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