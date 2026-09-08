import { memo, useEffect, useRef, useState } from 'react';
import { CHAT_STATS } from '../data/chatStats';
import './styles/ChatWrapped.css';

const formatNumber = (value) => new Intl.NumberFormat('ru-RU').format(value);

const StatIcon = ({ name }) => {
  const paths = {
    messages: <><path d="M4 5h16v11H9l-5 4Z" /><path d="M8 9h8M8 12h5" /></>,
    words: <><path d="M5 6h14M5 11h10M5 16h7" /><path d="m17 15 2 2 3-4" /></>,
    night: <><path d="M19 15a7 7 0 0 1-10-10 8 8 0 1 0 10 10Z" /><path d="M17 4v3M15.5 5.5h3" /></>,
    race: <><path d="M5 7h11M3 11h10M6 15h8" /><path d="m15 17 5-5-5-5" /></>,
    records: <><path d="M7 3h10v5a5 5 0 0 1-10 0Z" /><path d="M7 5H4v2a4 4 0 0 0 4 4M17 5h3v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6" /></>,
    verdict: <><path d="M12 21S3 16 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z" /><path d="m8 11 2.2 2.2L16 8" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

const AnimatedNumber = ({ value }) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / 1100, 1);
      setDisplayed(Math.round(value * (1 - ((1 - progress) ** 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return formatNumber(displayed);
};

const OverviewSlide = () => (
  <section className="wrapped-slide wrapped-slide--overview">
    <div className="wrapped-slide__icon"><StatIcon name="messages" /></div>
    <p className="wrapped-kicker">НАШ TELEGRAM · В ЦИФРАХ</p>
    <h2><AnimatedNumber value={CHAT_STATS.totalMessages} /></h2>
    <p className="wrapped-lead">сообщений за {CHAT_STATS.days} дней.<br />Ни одного нормального. И это прекрасно.</p>
    <div className="wrapped-split" aria-label="Сообщения по авторам">
      <div className="wrapped-split__labels">
        {CHAT_STATS.authors.map((author) => <span key={author.id}><strong>{author.name}</strong>{formatNumber(author.messages)}</span>)}
      </div>
      <div className="wrapped-split__bar"><span style={{ width: `${CHAT_STATS.authors[0].share}%` }} /></div>
      <small>{CHAT_STATS.authors[0].share}% / {CHAT_STATS.authors[1].share}% · почти идеальный баланс</small>
    </div>
  </section>
);

const AverageDaySlide = () => {
  const day = CHAT_STATS.averageDay;
  const details = [
    ['фото', day.photos],
    ['видео', day.videos],
    ['ночных', day.nightMessages],
  ];

  return (
    <section className="wrapped-slide wrapped-slide--average">
      <div className="wrapped-slide__icon"><StatIcon name="messages" /></div>
      <p className="wrapped-kicker">ОДИН ОБЫЧНЫЙ ДЕНЬ</p>
      <div className="wrapped-average-hero">
        <strong><AnimatedNumber value={day.messages} /></strong>
        <span>сообщений<br />в среднем</span>
      </div>
      <div className="wrapped-average-details" aria-label="Средние показатели за день">
        {details.map(([label, value], index) => (
          <article key={label} style={{ '--record-delay': `${index * 90}ms` }}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <p className="wrapped-average-caption">Каждый день у нас получался маленький сериал.</p>
    </section>
  );
};

const WordsSlide = () => {
  const maximum = CHAT_STATS.words[0].count;
  return (
    <section className="wrapped-slide wrapped-slide--words">
      <div className="wrapped-slide__icon"><StatIcon name="words" /></div>
      <p className="wrapped-kicker">СЛОВАРНЫЙ ЗАПАС ОТНОШЕНИЙ</p>
      <h2>Наш язык</h2>
      <div className="wrapped-word-cloud" aria-label="Самые частые слова">
        {CHAT_STATS.words.map(({ word, count }, index) => (
          <span key={word} style={{ '--word-scale': 0.72 + (count / maximum) * 0.72, '--word-delay': `${index * 55}ms` }}>
            {word}<small>{formatNumber(count)}</small>
          </span>
        ))}
      </div>
      <div className="wrapped-signatures">
        {CHAT_STATS.signatureWords.map((item) => <p key={item.author}><span>{item.author}</span><strong>«{item.word}»</strong><small>{item.count} раз</small></p>)}
      </div>
    </section>
  );
};

const NightSlide = () => {
  const maximum = Math.max(...CHAT_STATS.hours);
  return (
    <section className="wrapped-slide wrapped-slide--night">
      <div className="wrapped-slide__icon"><StatIcon name="night" /></div>
      <p className="wrapped-kicker">РЕЖИМ СНА · ОТМЕНЁН</p>
      <h2><AnimatedNumber value={CHAT_STATS.nightMessages} /></h2>
      <p className="wrapped-lead">сообщений отправлено между полуночью и шестью утра</p>
      <div className="wrapped-hours" aria-label="Активность по часам">
        {CHAT_STATS.hours.map((count, hour) => (
          <span key={hour} className={hour < 6 ? 'is-night' : ''} title={`${String(hour).padStart(2, '0')}:00 - ${formatNumber(count)}`}>
            <i style={{ height: `${Math.max(6, (count / maximum) * 100)}%` }} />
            {hour % 3 === 0 && <small>{String(hour).padStart(2, '0')}</small>}
          </span>
        ))}
      </div>
      <strong className="wrapped-night-verdict">Пиковое время: 00:00. Разум уже спит. Любовь ещё печатает.</strong>
    </section>
  );
};

const RaceSlide = () => (
  <section className="wrapped-slide wrapped-slide--race">
    <div className="wrapped-slide__icon"><StatIcon name="race" /></div>
    <p className="wrapped-kicker">КТО БЫСТРЕЕ · КТО ПЕРВЫЙ</p>
    <h2>Она отвечает быстрее.<br /><em>Лёва пишет первым.</em></h2>
    <div className="wrapped-race-grid">
      {CHAT_STATS.authors.map((author) => (
        <article key={author.id} className={`is-${author.id}`}>
          <span>{author.name}</span>
          <strong>{author.medianReplySeconds}<small> сек</small></strong>
          <p>медианный ответ</p>
          <div><i style={{ width: `${author.startsAfterSilence / 3}%` }} /></div>
          <small>{author.startsAfterSilence} раз начал{author.id === 'her' ? 'а' : ''} разговор после долгой тишины</small>
        </article>
      ))}
    </div>
  </section>
);

const RecordsSlide = () => {
  const records = [
    ['ФОТОГРАФИЙ', CHAT_STATS.media.photos],
    ['ВИДЕО', CHAT_STATS.media.videos],
    ['ГОЛОСОВЫХ', CHAT_STATS.media.voices],
    ['«ЛЮБЛЮ»', CHAT_STATS.loveMessages],
    ['СМЕХА', CHAT_STATS.laughterMessages],
    ['ВОПРОСОВ', CHAT_STATS.questionMessages],
  ];
  return (
    <section className="wrapped-slide wrapped-slide--records">
      <div className="wrapped-slide__icon"><StatIcon name="records" /></div>
      <p className="wrapped-kicker">ОФИЦИАЛЬНЫЕ РЕКОРДЫ</p>
      <h2>Это уже диагноз</h2>
      <div className="wrapped-record-grid">
        {records.map(([label, value], index) => <article key={label} style={{ '--record-delay': `${index * 65}ms` }}><strong>{formatNumber(value)}</strong><span>{label}</span></article>)}
      </div>
      <div className="wrapped-record-footer">
        <p><strong>{CHAT_STATS.busiestDay.messages}</strong><span>сообщения за один день<br />{CHAT_STATS.busiestDay.date}</span></p>
        <p><strong>{CHAT_STATS.longestStreakDays}</strong><span>дней подряд<br />без исчезновения</span></p>
        <p><strong>{CHAT_STATS.goodnightMessages}</strong><span>пожелание<br />спокойной ночи</span></p>
      </div>
    </section>
  );
};

const FormulaSlide = () => (
  <section className="wrapped-slide wrapped-slide--formula">
    <div className="wrapped-slide__icon"><StatIcon name="words" /></div>
    <p className="wrapped-kicker">ФОРМУЛА ПЕРЕПИСКИ</p>
    <h2>Каждое сообщение<br /><em>что-то значит</em></h2>
    <div className="wrapped-formula-list" aria-label="Как часто встречались разные сообщения">
      {CHAT_STATS.messageIntervals.map((item, index) => (
        <article key={item.label} style={{ '--record-delay': `${index * 75}ms` }}>
          <small>каждое</small>
          <strong>{item.every}-е</strong>
          <span>{item.label}</span>
          <i>{formatNumber(item.value)} раз</i>
        </article>
      ))}
    </div>
  </section>
);

const FinalSlide = ({ onClose }) => (
  <section className="wrapped-slide wrapped-slide--final">
    <div className="wrapped-orbit wrapped-orbit--one" aria-hidden="true" />
    <div className="wrapped-orbit wrapped-orbit--two" aria-hidden="true" />
    <div className="wrapped-slide__icon"><StatIcon name="verdict" /></div>
    <p className="wrapped-kicker">КРАТКИЙ ИТОГ</p>
    <h2>Мы как<br /><em>всегда</em></h2>
    <p className="wrapped-lead">Много говорим, поздно ложимся и всё равно скучаем.</p>
    <button type="button" onClick={onClose}>Продолжить</button>
  </section>
);

const SLIDE_LABELS = ['Итог', 'День', 'Словарь', 'Ночь', 'Скорость', 'Формула', 'Рекорды', 'Финал'];

const ChatWrapped = memo(({ onClose }) => {
  const [slide, setSlide] = useState(0);
  const touchStart = useRef(null);

  const goTo = (next) => setSlide(Math.max(0, Math.min(SLIDE_LABELS.length - 1, next)));

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') setSlide((current) => Math.min(SLIDE_LABELS.length - 1, current + 1));
      if (event.key === 'ArrowLeft') setSlide((current) => Math.max(0, current - 1));
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <main
      className={`chat-wrapped chat-wrapped--slide-${slide + 1}`}
      onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStart.current;
        if (distance < -45) goTo(slide + 1);
        if (distance > 45) goTo(slide - 1);
        touchStart.current = null;
      }}
    >
      <header className="chat-wrapped__header">
        <div><span>НАША СТАТИСТИКА БЕЗ ЦЕНЗУРЫ</span><strong>{CHAT_STATS.range[0]} - {CHAT_STATS.range[1]}</strong></div>
        <button type="button" onClick={onClose} aria-label="Закрыть статистику">×</button>
      </header>

      <nav className="chat-wrapped__progress" aria-label="Разделы статистики">
        {SLIDE_LABELS.map((label, index) => <button type="button" key={label} className={index === slide ? 'is-active' : index < slide ? 'is-viewed' : ''} onClick={() => goTo(index)} aria-label={`Открыть раздел «${label}»`}><span /></button>)}
      </nav>

      <div key={slide} className="chat-wrapped__stage">
        {slide === 0 && <OverviewSlide />}
        {slide === 1 && <AverageDaySlide />}
        {slide === 2 && <WordsSlide />}
        {slide === 3 && <NightSlide />}
        {slide === 4 && <RaceSlide />}
        {slide === 5 && <FormulaSlide />}
        {slide === 6 && <RecordsSlide />}
        {slide === 7 && <FinalSlide onClose={onClose} />}
      </div>

      <footer className="chat-wrapped__navigation">
        <button type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Предыдущий экран">←</button>
        <span>{String(slide + 1).padStart(2, '0')} / {String(SLIDE_LABELS.length).padStart(2, '0')} · {SLIDE_LABELS[slide]}</span>
        <button type="button" onClick={() => goTo(slide + 1)} disabled={slide === SLIDE_LABELS.length - 1} aria-label="Следующий экран">→</button>
      </footer>
    </main>
  );
});

export default ChatWrapped;
