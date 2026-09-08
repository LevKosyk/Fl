import { memo, useMemo, useState } from 'react';

const QUOTES = [
  { id: 1, text: 'как у тебя там нижний бурбулятор?', author: 'leva', date: '15.01.2026' },
  { id: 2, text: 'чувствовала себя как та мышь из мема', author: 'her', date: '15.06.2026' },
  { id: 3, text: 'я возле тебя выгляжу как бомж', author: 'leva', date: '04.03.2026' },
  { id: 4, text: 'У НАС ТУТ ПАРНЫЕ ТРУСЫ АОСОЛАООСОС', author: 'her', date: '05.10.2025' },
  { id: 5, text: 'хуй знает зачем просто прикольно', author: 'leva', date: '12.11.2025' },
  { id: 6, text: 'мысль состоит в том, что я дура', author: 'her', date: '06.07.2025' },
  { id: 7, text: 'бля если в тебя глисты', author: 'leva', date: '03.09.2026' },
  { id: 8, text: 'я нажрусь пиццы в универе и у тебя обосрусь', author: 'her', date: '11.12.2025' },
  { id: 9, text: 'у тебя кукуха поехала', author: 'leva', date: '05.10.2025' },
  { id: 10, text: 'хаахвхахах я сломала тебе психику немного', author: 'her', date: '09.09.2025' },
  { id: 11, text: 'тебе смешно а мне страшно', author: 'leva', date: '22.11.2025' },
  { id: 12, text: 'тебе подсказать сайты знакомств?', author: 'her', date: '10.11.2025' },
  { id: 13, text: 'я думал типо писать какие у тебя сегодня трусы', author: 'leva', date: '12.11.2025' },
  { id: 14, text: 'я имею ввиду у тебя сопли?', author: 'her', date: '27.06.2026' },
  { id: 15, text: 'и потом мне попался просто ебенический сериал', author: 'leva', date: '11.01.2026' },
];

const AUTHOR_LABELS = { leva: 'Лёва', her: 'Она' };

const QuoteMark = () => (
  <svg viewBox="0 0 48 38" aria-hidden="true">
    <path d="M20 5H9C5 5 3 8 3 12v8c0 4 3 7 7 7h2c0 4-2 6-6 8 9 0 14-5 14-14V5Zm25 0H34c-4 0-6 3-6 7v8c0 4 3 7 7 7h2c0 4-2 6-6 8 9 0 14-5 14-14V5Z" />
  </svg>
);

const WhoSaidItGame = memo(({ onClose }) => {
  const [round, setRound] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const quote = QUOTES[round];
  const isCorrect = selectedAuthor === quote?.author;
  const score = answers.filter((answer) => answer.isCorrect).length;
  const streak = useMemo(() => {
    let count = 0;
    for (let index = answers.length - 1; index >= 0 && answers[index].isCorrect; index -= 1) count += 1;
    return count;
  }, [answers]);
  const resultCopy = useMemo(() => {
    if (score >= 13) return 'Подозрительно хорошо. Вы точно слишком много переписываетесь.';
    if (score >= 9) return 'Ваш общий язык официально подтверждён перепиской.';
    return 'Некоторые сообщения были написаны в состоянии великой загадочности.';
  }, [score]);

  const chooseAuthor = (author) => {
    if (selectedAuthor) return;
    setSelectedAuthor(author);
    setAnswers((current) => [...current, {
      quoteId: quote.id,
      selectedAuthor: author,
      correctAuthor: quote.author,
      isCorrect: author === quote.author,
    }]);
  };

  const nextRound = () => {
    if (round === QUOTES.length - 1) {
      setIsFinished(true);
      return;
    }
    setRound((current) => current + 1);
    setSelectedAuthor(null);
  };

  const restart = () => {
    setRound(0);
    setSelectedAuthor(null);
    setAnswers([]);
    setIsFinished(false);
  };

  return (
    <section className="who-said-game" aria-label="Игра Кто из нас это написал">
      <div className="who-said-game__progress" aria-label={`Раунд ${round + 1} из ${QUOTES.length}`}>
        {QUOTES.map((item, index) => {
          const answer = answers[index];
          const state = answer ? (answer.isCorrect ? 'is-correct' : 'is-wrong') : (index === round ? 'is-active' : '');
          return <i key={item.id} className={state} />;
        })}
      </div>

      {!isFinished ? (
        <div key={quote.id} className={`who-said-game__round ${selectedAuthor ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`}>
          <header className="who-said-game__meta">
            <span>СООБЩЕНИЕ ИЗ АРХИВА</span>
            <div>
              {streak >= 2 && <em>СЕРИЯ ×{streak}</em>}
              <strong>СЧЁТ {score} · {String(round + 1).padStart(2, '0')} / {String(QUOTES.length).padStart(2, '0')}</strong>
            </div>
          </header>

          <blockquote className="who-said-game__quote">
            <span className="who-said-game__mark"><QuoteMark /></span>
            <p>{quote.text}</p>
          </blockquote>

          <div className="who-said-game__choices">
            <p>{selectedAuthor ? 'Ответ зафиксирован' : 'Кто из нас это написал?'}</p>
            <div>
              {Object.entries(AUTHOR_LABELS).map(([author, label]) => {
                const isRightAnswer = selectedAuthor && author === quote.author;
                const isWrongAnswer = selectedAuthor === author && author !== quote.author;
                return (
                  <button
                    type="button"
                    key={author}
                    disabled={Boolean(selectedAuthor)}
                    className={`${isRightAnswer ? 'is-correct' : ''} ${isWrongAnswer ? 'is-wrong' : ''} ${selectedAuthor && !isRightAnswer && !isWrongAnswer ? 'is-muted' : ''}`.trim()}
                    onClick={() => chooseAuthor(author)}
                  >
                    <span>{author === 'leva' ? 'Л' : 'О'}</span>
                    {label}
                    {isRightAnswer && <b aria-label="Правильный ответ">✓</b>}
                    {isWrongAnswer && <b aria-label="Неправильный ответ">×</b>}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedAuthor && (
            <div className={`who-said-game__reveal ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status">
              {isCorrect && <div className="who-said-game__sparkles" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((item) => <i key={item}>♥</i>)}</div>}
              <div className={`who-said-game__bubble ${quote.author === 'leva' ? 'is-leva' : 'is-her'}`}>
                <span>{AUTHOR_LABELS[quote.author]}</span>
                <p>{quote.text}</p>
                <small>{quote.date}</small>
              </div>
              <div className="who-said-game__verdict">
                <span>{isCorrect ? 'ТОЧНО В ЦЕЛЬ' : 'ВОТ ЭТО ПОВОРОТ'}</span>
                <strong>{isCorrect ? 'Угадано' : `Это ${quote.author === 'leva' ? 'Лёва' : 'была она'}`}</strong>
              </div>
              <button type="button" onClick={nextRound}>
                {round === QUOTES.length - 1 ? 'Узнать результат' : 'Следующая фраза'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="who-said-game__finish" role="status">
          <div className="who-said-game__confetti" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <i key={item}>♥</i>)}</div>
          <span className="who-said-game__finish-mark"><QuoteMark /></span>
          <p>ТЕЛЕГРАМ ВЫНЕС ВЕРДИКТ</p>
          <h3>{score}<small> / {QUOTES.length}</small></h3>
          <strong>{resultCopy}</strong>
          <div className="who-said-game__result-strip" aria-label={`${score} правильных ответов из ${QUOTES.length}`}>
            {answers.map((answer, index) => (
              <span key={answer.quoteId} className={answer.isCorrect ? 'is-correct' : 'is-wrong'} aria-label={`Вопрос ${index + 1}: ${answer.isCorrect ? 'правильно' : 'неправильно'}`}>
                <small>{String(index + 1).padStart(2, '0')}</small>
                <b>{answer.isCorrect ? '✓' : '×'}</b>
              </span>
            ))}
          </div>
          <div className="who-said-game__finish-actions">
            <button type="button" className="is-secondary" onClick={restart}>Сыграть ещё раз</button>
            <button type="button" onClick={onClose}>Готово</button>
          </div>
        </div>
      )}
    </section>
  );
});

export default WhoSaidItGame;
