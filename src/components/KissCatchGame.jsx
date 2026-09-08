import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const GOAL = 10;
const ROUND_SECONDS = 22;

const nextPosition = () => ({
  x: 10 + Math.random() * 80,
  y: 18 + Math.random() * 64,
  id: `${Date.now()}-${Math.random()}`,
});

const getStage = (score) => {
  if (score < 3) return { number: '01', label: 'Разминка', delay: 1450 };
  if (score < 7) return { number: '02', label: 'Погоня', delay: 1000 };
  return { number: '03', label: 'Финальный рывок', delay: 720 };
};

const feedbackLines = ['Есть контакт', 'Этот твой', 'Красиво поймано', 'Ещё ближе', 'Не отпускай серию'];

const KissMark = () => (
  <svg viewBox="0 0 64 44" aria-hidden="true">
    <path d="M5 23C13 9 23 5 32 14C41 5 51 9 59 23C50 37 16 37 5 23Z" />
    <path d="M8 23c13-3 35-3 48 0M20 14c4 4 8 5 12 0M44 14c-4 4-8 5-12 0" />
  </svg>
);

const KissCatchGame = memo(({ onComplete }) => {
  const [phase, setPhase] = useState('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [target, setTarget] = useState(nextPosition);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [feedback, setFeedback] = useState('Лови первый');
  const [burst, setBurst] = useState(null);

  const stage = useMemo(() => getStage(score), [score]);
  const isFinalKiss = score === GOAL - 1;

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setStreak(0);
    setBestStreak(0);
    setEscaped(0);
    setFeedback('Лови первый');
    setBurst(null);
    setTarget(nextPosition());
    setPhase('playing');
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const timerId = window.setInterval(() => {
      setTimeLeft((seconds) => {
        if (seconds <= 1) {
          setPhase('lost');
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const moveId = window.setTimeout(() => {
      setTarget(nextPosition());
      setStreak(0);
      setEscaped((count) => count + 1);
      setFeedback(isFinalKiss ? 'Последний особенно шустрый' : 'Убежал — ищи дальше');
    }, stage.delay);

    return () => window.clearTimeout(moveId);
  }, [phase, target.id, stage.delay, isFinalKiss]);

  useEffect(() => {
    if (!burst) return undefined;
    const burstId = window.setTimeout(() => setBurst(null), 520);
    return () => window.clearTimeout(burstId);
  }, [burst]);

  const catchKiss = () => {
    const nextScore = score + 1;
    const nextStreak = streak + 1;

    setBurst({ x: target.x, y: target.y, id: target.id });
    setScore(nextScore);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    setFeedback(isFinalKiss ? 'Ключ от письма пойман' : feedbackLines[score % feedbackLines.length]);

    if (nextScore >= GOAL) {
      setPhase('won');
      return;
    }

    setTarget(nextPosition());
  };

  return (
    <div className={`kiss-game kiss-game--${phase}`}>
      <div className="kiss-game__hud">
        <div><span>ПОЙМАНО</span><strong>{score} / {GOAL}</strong></div>
        <div className="kiss-game__progress" aria-label={`Поймано ${score} из ${GOAL}`}>
          {Array.from({ length: GOAL }, (_, index) => (
            <i key={index} className={index < score ? 'is-caught' : ''} />
          ))}
        </div>
        <div><span>ВРЕМЯ</span><strong>{timeLeft} сек</strong></div>
      </div>

      <div className="kiss-game__field">
        {phase === 'playing' && (
          <>
            <div className="kiss-game__stage"><span>ЭТАП {stage.number}</span><strong>{stage.label}</strong></div>
            <div className={`kiss-game__feedback ${streak >= 3 ? 'is-hot' : ''}`} aria-live="polite">
              <span>{feedback}</span>
              {streak >= 2 && <strong>Серия ×{streak}</strong>}
            </div>

            <button
              key={target.id}
              type="button"
              className={`kiss-target ${isFinalKiss ? 'is-final' : ''}`}
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              onClick={catchKiss}
              aria-label={isFinalKiss ? 'Поймать финальный поцелуй' : `Поймать поцелуй ${score + 1} из ${GOAL}`}
            >
              {isFinalKiss && <span className="kiss-target__label">ФИНАЛ</span>}
              <KissMark />
            </button>

            {burst && (
              <span className="kiss-burst" style={{ left: `${burst.x}%`, top: `${burst.y}%` }} aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => <i key={index}>♥</i>)}
              </span>
            )}
          </>
        )}

        {phase === 'intro' && (
          <div className="kiss-game__panel">
            <span className="kiss-game__seal"><KissMark /></span>
            <p className="kiss-game__eyebrow">ТРИ ЭТАПА · ОДНО ПИСЬМО</p>
            <h3>Поймай мои поцелуи</h3>
            <p>Лови быстро: с каждым этапом они становятся шустрее. Упустишь один — серия начнётся заново.</p>
            <div className="kiss-game__rules" aria-label="Правила игры">
              <span><strong>{GOAL}</strong> поцелуев</span>
              <span><strong>{ROUND_SECONDS}</strong> секунды</span>
              <span><strong>3</strong> этапа</span>
            </div>
            <button type="button" onClick={startGame}>Начать погоню</button>
          </div>
        )}

        {phase === 'won' && (
          <div className="kiss-game__panel kiss-game__panel--result" role="status">
            <span className="kiss-game__seal is-won"><KissMark /></span>
            <p className="kiss-game__eyebrow">КЛЮЧ ОТ ПИСЬМА ТВОЙ</p>
            <h3>Все поцелуи пойманы</h3>
            <p>Даже самый шустрый не смог убежать. Теперь можно открыть самое личное.</p>
            <div className="kiss-game__result-stats">
              <span><strong>{ROUND_SECONDS - timeLeft} сек</strong> время</span>
              <span><strong>×{bestStreak}</strong> лучшая серия</span>
              <span><strong>{escaped}</strong> убежали</span>
            </div>
            <button type="button" onClick={onComplete}>Открыть письмо</button>
          </div>
        )}

        {phase === 'lost' && (
          <div className="kiss-game__panel kiss-game__panel--result" role="status">
            <span className="kiss-game__seal"><KissMark /></span>
            <p className="kiss-game__eyebrow">ПОЦЕЛУИ РАЗБЕЖАЛИСЬ</p>
            <h3>Почти получилось</h3>
            <p>Ты поймала {score} из {GOAL}. Никаких штрафов — следующая попытка точно твоя.</p>
            <button type="button" onClick={startGame}>Попробовать снова</button>
          </div>
        )}
      </div>
    </div>
  );
});

export default KissCatchGame;
