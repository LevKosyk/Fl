import { memo, useCallback, useEffect, useRef, useState } from 'react';

const randomPosition = (previous = { x: 72, y: 58 }) => {
  let next;

  do {
    next = {
      x: 10 + Math.random() * 80,
      y: 18 + Math.random() * 68,
    };
  } while (Math.hypot(next.x - previous.x, next.y - previous.y) < 28);

  return next;
};

const BestLevaGame = memo(({ onComplete, onClose }) => {
  const [noPosition, setNoPosition] = useState({ x: 72, y: 58 });
  const [escapes, setEscapes] = useState(0);
  const [answeredYes, setAnsweredYes] = useState(false);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!answeredYes) return undefined;
    const revealId = window.setTimeout(() => completeRef.current(), 1700);
    return () => window.clearTimeout(revealId);
  }, [answeredYes]);

  const escape = useCallback((event) => {
    event?.preventDefault();
    event?.stopPropagation();
    setNoPosition((position) => randomPosition(position));
    setEscapes((count) => count + 1);
  }, []);

  return (
    <section className={`best-leva-game ${answeredYes ? 'is-success' : ''}`} aria-label="Проверка перед историями">
      <div className="best-leva-game__grain" aria-hidden="true" />
      <button type="button" className="best-leva-game__close" onClick={onClose} aria-label="Закрыть игру">×</button>

      <div className="best-leva-game__chapter">
        <span>ПРОВЕРКА НА ВНИМАТЕЛЬНОСТЬ</span>
        <strong>01 / ИСТОРИИ</strong>
      </div>

      {!answeredYes ? (
        <div className="best-leva-game__question">
          <span className="best-leva-game__seal" aria-hidden="true">Л</span>
          <p>ОДИН ОЧЕНЬ ВАЖНЫЙ ВОПРОС</p>
          <h2>Лёва лучший?</h2>
          <button type="button" className="best-leva-game__yes" onClick={() => setAnsweredYes(true)}>
            Да, конечно
          </button>
        </div>
      ) : (
        <div className="best-leva-game__success" role="status" aria-live="polite">
          <span aria-hidden="true">♥</span>
          <p>ОТВЕТ ПРИНЯТ</p>
          <h2>Я так и знал.</h2>
          <strong>И зачем было выделываться?</strong>
          <small>Открываю истории…</small>
        </div>
      )}

      {!answeredYes && (
        <button
          type="button"
          className="best-leva-game__no"
          style={{ left: `${noPosition.x}%`, top: `${noPosition.y}%` }}
          onPointerEnter={escape}
          onPointerDown={escape}
          onClick={escape}
          aria-label="Нет — кнопка попытается убежать"
        >
          Нет
        </button>
      )}

      {!answeredYes && (
        <div className="best-leva-game__hint" aria-live="polite">
          {escapes === 0 ? 'Выбирай честно' : escapes < 3 ? 'Не туда нажимаешь' : 'Она всё равно не сдастся'}
        </div>
      )}
    </section>
  );
});

export default BestLevaGame;
