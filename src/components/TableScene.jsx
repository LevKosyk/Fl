import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import "./styles/Table.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import VideoScreen from "./VideoScreen";
import KissCatchGame from "./KissCatchGame";
import BestLevaGame from "./BestLevaGame";
import WhoSaidItGame from "./WhoSaidItGame";
import ChatWrapped from "./ChatWrapped";
import { Modal, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import storyPhotoOne from "../assets/years/2026/IMG_9095.jpg";
import storyPhotoTwo from "../assets/years/2026/IMG_9096.jpg";
import { AVAILABLE_YEARS, YEAR_DATA } from "../data/yearData";

const REQUIRED_SECTION_IDS = ["chat", "photos", "map", "letter", "timeline"];

const storySlides = [
  { id: "walk-one", src: storyPhotoOne, question: "Идём гулять?", options: ["Да", "Нет"] },
  { id: "walk-two", src: storyPhotoTwo, question: "Ну что, идём?", options: ["Да", "Конечно"] },
];

const CardIcon = memo(({ name, compact = false, locked = false }) => {
  const paths = {
    story: <><rect x="7" y="3" width="12" height="16" rx="3" /><path d="M5 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9" /><path d="m11 8 5 3-5 3Z" /></>,
    chat: <><path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.4-4.2A9 9 0 1 1 21 12Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    photos: <><rect x="3" y="5" width="14" height="16" rx="3" /><path d="M7 5V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-2" /><circle cx="8" cy="10" r="1.5" /><path d="m5 18 4-4 3 3 2-2 3 3" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></>,
    letter: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /><path d="m4 17 5-5M20 17l-5-5" /></>,
    timeline: <><path d="M7 4v16M7 7h10M7 12h7M7 17h10" /><circle cx="7" cy="7" r="2" /><circle cx="7" cy="12" r="2" /><circle cx="7" cy="17" r="2" /></>,
    quote: <><path d="M9 11H5a4 4 0 0 0 4 4v4H5a8 8 0 0 1 0-16h4ZM21 11h-4a4 4 0 0 0 4 4v4h-4a8 8 0 0 1 0-16h4Z" /></>,
    stats: <><path d="M5 20V10M12 20V4M19 20v-7" /><path d="M3 20h18" /><circle cx="5" cy="7" r="2" /><circle cx="19" cy="10" r="2" /></>,
  };

  return (
    <span className={`card-icon ${compact ? 'card-icon--compact' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
      {locked && <span className="card-icon__lock" />}
    </span>
  );
});

const items = [
  { id: "chat", label: "Переписка", type: "chat", area: "div1" },
  { id: "photos", label: "Фотографии", type: "photos", area: "div2" },
  { id: "map", label: "Карта", type: "map", area: "div3" },
  { id: "letter", label: "Письмо", type: "letter", area: "div4" },
  { id: "timeline", label: "Хронология", type: "timeline", area: "div5" },
  { id: "text", label: 'Расстояние само по себе ничего не значит. Оно становится испытанием: либо ты понимаешь, что любовь — лишь привычка, и тогда расстояние всё рушит, либо ты осознаёшь, что любовь — это глубже, чем привычка, и тогда никакие километры не в силах её убить.', author: "Марк Аврелий", year: "245 до н.э.", type: "citation", area: "div6" },
  { id: "text2", label: "Специальный сюрприз", description: "Нажми кнопку, чтобы увидеть кое-что особенное...", type: "video", area: "div7" },
];

// Photo marker component for displaying thumbnails directly on the map
const PhotoMarker = memo(({ position, photo, text }) => {
  const photoIcon = useMemo(() => L.divIcon({
      className: 'enhanced-photo-marker',
      html: `
        <div class="enhanced-marker-container">
          <div class="marker-glow"></div>
          <img 
            src="${photo}"
            alt="${text}"
            class="enhanced-marker-image"
          />
          <div class="marker-heart">♥</div>
        </div>
      `,
      iconSize: [76, 84],
      iconAnchor: [38, 76]
    }), [photo, text]);

  return (
    <Marker position={position} icon={photoIcon}>
      <Popup className="enhanced-popup">
        <div className="popup-container">
          <div className="popup-header">
            <span>НАША ТОЧКА</span>
            <h3 className="popup-title">{text}</h3>
          </div>
          <div className="popup-image-container">
            <img
              src={photo}
              alt={text}
              className="popup-image"
              loading="lazy"
              decoding="async"
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="popup-footer">
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

const RouteMarker = memo(({ position, text, detail, order }) => {
  const routeIcon = useMemo(() => L.divIcon({
    className: 'route-marker-shell',
    html: `<div class="route-marker"><span>${order}</span></div>`,
    iconSize: [42, 48],
    iconAnchor: [21, 44],
    popupAnchor: [0, -42],
  }), [order]);

  return (
    <Marker position={position} icon={routeIcon}>
      <Popup className="enhanced-popup route-popup">
        <div className="route-popup-content">
          <span>ТОЧКА {String(order).padStart(2, '0')}</span>
          <h3>{text}</h3>
          <p>{detail}</p>
        </div>
      </Popup>
    </Marker>
  );
});

const MapViewport = memo(({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return undefined;

    const bounds = L.latLngBounds(markers.map(({ position }) => position));
    const resizeId = window.setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [42, 42], maxZoom: 13 });
    }, 180);

    return () => window.clearTimeout(resizeId);
  }, [map, markers]);

  return null;
});

// Sample chat messages
const chatMessages = [
  { id: 1, author: "me", text: "Иди сюда", time: "10:30" },
  { id: 2, author: "me", text: "Чай подали", time: "10:31" },
  { id: 3, author: "she", text: "хало", time: "10:32" },
  { id: 4, author: "she", text: "в общем, Давид не хочет, он в депрессии", time: "10:33" },
  { id: 5, author: "me", text: "меме", time: "10:34" },
  { id: 6, author: "me", text: "Он такой по жизни", time: "10:35" },
  { id: 7, author: "me", text: "Не привыкай", time: "10:36" },
  { id: 8, author: "me", text: "Да, я его понимаю", time: "10:37" },
  { id: 9, author: "she", text: "тут просто кошмар", time: "10:38" },
  { id: 10, author: "she", text: "в какой дисперсии? Два кружочка даше и он на небе", time: "10:38" },
  { id: 11, author: "she", text: "чо тут?", time: "10:38" },
  { id: 12, author: "she", text: "обсуждаем что случилось", time: "10:38" },
  { id: 13, author: "system", text: "после этого было написало еще +33 546 сообщений и мы оказались в этой точке, где сейчас находимся", time: "10:39" },
];


const getInitialYear = () => {
  const requestedYear = new URLSearchParams(window.location.search).get("year");
  return YEAR_DATA[requestedYear] ? requestedYear : AVAILABLE_YEARS.at(-1);
};

const GridPage = memo(() => {
  const [activeYear, setActiveYear] = useState(getInitialYear);
  const [activeItem, setActiveItem] = useState(null);
  const [modalType, setModalType] = useState(null); // Track which modal is open
  const [showLetter, setShowLetter] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyVotes, setStoryVotes] = useState({});
  const [puzzlesSolvedByYear, setPuzzlesSolvedByYear] = useState(() =>
    Object.fromEntries(AVAILABLE_YEARS.map((year) => [year, new Set()]))
  );
  const chatEndRef = useRef(null);
  const storyTouchStartX = useRef(null);
  const [visitedByYear, setVisitedByYear] = useState(() =>
    Object.fromEntries(AVAILABLE_YEARS.map((year) => [year, new Set()]))
  );

  const yearContent = YEAR_DATA[activeYear];
  const visitedItems = visitedByYear[activeYear] ?? new Set();
  const solvedPuzzles = puzzlesSolvedByYear[activeYear] ?? new Set();
  const isLetterPuzzleSolved = solvedPuzzles.has('letter');
  const isStoryPuzzleSolved = solvedPuzzles.has('stories');

  const allSectionsVisited = REQUIRED_SECTION_IDS.every(section => visitedItems.has(section));

  const markAsVisited = useCallback((itemId) => {
    if (!REQUIRED_SECTION_IDS.includes(itemId)) return;
    setVisitedByYear(prev => {
      const current = prev[activeYear] ?? new Set();
      if (current.has(itemId)) return prev;
      return { ...prev, [activeYear]: new Set(current).add(itemId) };
    });
  }, [activeYear]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("year", activeYear);
    window.history.replaceState({}, "", url);
  }, [activeYear]);

  useEffect(() => {
    if (modalType === "chat" && activeYear === "2025") {
      setVisibleMessages([]);
      setIsTyping(true);

      let timeoutId;
      let cancelled = false;

      const showNextMessage = (currentIndex) => {
        if (currentIndex < chatMessages.length) {
          timeoutId = setTimeout(() => {
            if (cancelled) return;
            setVisibleMessages(prevMessages => [...prevMessages, chatMessages[currentIndex]]);
            setIsTyping(false);
            timeoutId = setTimeout(() => {
              if (cancelled) return;
              setIsTyping(true);
              showNextMessage(currentIndex + 1);
            }, 320);
          }, currentIndex === 0 ? 500 : 780);
        } else {
          setIsTyping(false);
        }
      };

      showNextMessage(0);

      return () => {
        cancelled = true;
        if (timeoutId) clearTimeout(timeoutId);
        setIsTyping(false);
      };
    }
  }, [modalType, activeYear]);

  useEffect(() => {
    if (modalType === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [visibleMessages, isTyping, modalType]);

  useEffect(() => {
    if (modalType !== "chat" || activeYear !== "2026") return undefined;

    const handleStoryKeys = (event) => {
      if (event.key === "ArrowLeft") setStoryIndex(index => Math.max(0, index - 1));
      if (event.key === "ArrowRight") setStoryIndex(index => Math.min(storySlides.length - 1, index + 1));
    };

    window.addEventListener("keydown", handleStoryKeys);
    return () => window.removeEventListener("keydown", handleStoryKeys);
  }, [modalType, activeYear]);

  const renderItemContent = useCallback((item) => {
    switch (item.type) {
      case "text":
        return (
          <div className="grid-item-container">
            <div
              className="grid-item-text"
              style={{
                background: 'linear-gradient(270deg, #ff6ec4, #7873f5, #42e695, #ff6ec4)',
                backgroundSize: '800% 800%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1rem',
                fontWeight: 'bold',
                lineHeight: 1.4,
                textShadow: '1px 1px 4px rgba(0,0,0,0.2)',
                animation: 'gradientShift 10s ease infinite',
              }}
            >
              {item.label}
            </div>
          </div>
        );
      case "citation":
        return (
          <div className="grid-item-container">
            <div className="grid-item-text">
              <CardIcon name="quote" compact />
              <blockquote className="italic text-xs mb-2 line-clamp-4">
                {yearContent.quote.text}
              </blockquote>
              <div className="text-right text-xs">
                <cite className="font-bold">{yearContent.quote.author}</cite>
                <div>{yearContent.quote.date}</div>
              </div>
            </div>
          </div>
        );
      case "map":
        return (
          <div className="grid-item-container map-grid-item">
            <div className="grid-item-text">
              <CardIcon name="map" />
              <h3 className="text-lg font-bold mb-2 map-grid-title">Карта</h3>
              <p className="text-xs mb-3 map-grid-subtitle">Нажмите, чтобы открыть</p>
              <div className="map-stats-badge mt-3">
                <span className="badge bg-light text-dark">
                  {yearContent.markers.length
                    ? `${yearContent.markers.length} ${yearContent.route ? "точек" : "мест"}`
                    : "места скоро"}
                </span>
              </div>
            </div>
          </div>
        );
      case "timeline":
        return (
          <div className={`grid-item-container ${activeYear === '2026' ? 'quiz-grid-item' : ''}`}>
            <div className="grid-item-text">
              <CardIcon name={activeYear === '2026' ? 'quote' : 'timeline'} />
              <h3 className="text-lg font-bold mb-1">{activeYear === '2026' ? 'Кто из нас?' : 'Хронология'}</h3>
              <p className="text-xs">{activeYear === '2026' ? 'Угадай автора наших сообщений' : 'Нажмите, чтобы открыть'}</p>
              {activeYear === '2026' && <span className="quiz-grid-badge">15 фраз · 2 автора</span>}
            </div>
          </div>
        );
      case "letter":
        if (activeYear === '2026') {
          return (
            <div className="grid-item-container stats-grid-item">
              <div className="grid-item-text">
                <CardIcon name="stats" />
                <p className="stats-grid-kicker">TELEGRAM WRAPPED</p>
                <h3 className="text-lg font-bold mb-2 stats-grid-title">Статистика<br />без цензуры</h3>
                <p className="text-xs stats-grid-subtitle">63 497 сообщений</p>
                <span className="stats-grid-badge">Смотреть отчёт</span>
                <div className="stats-grid-chart" aria-hidden="true">
                  {[42, 68, 53, 88, 62, 96, 74].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="grid-item-container letter-grid-item">
            <div className="grid-item-text">
              <CardIcon name="letter" locked={!isLetterPuzzleSolved} />
              <h3 className="text-lg font-bold mb-2 letter-grid-title">{item.label}</h3>
              <p className="text-xs mb-3 letter-grid-subtitle">Нажми, чтобы открыть письмо</p>
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="grid-item-container photo-grid-item">
            <div className="grid-item-text">
              <CardIcon name="photos" />
              <h3 className="text-lg font-bold mb-1 photo-grid-title">Фотографии</h3>
              <p className="text-xs mb-2 photo-grid-subtitle">Нажмите, чтобы открыть</p>
              <div className="photo-counter-badge">
                <span className="badge bg-light text-dark">{yearContent.photos.length} фото</span>
              </div>
              <div className="photo-preview-grid mt-2" aria-hidden="true">
                {yearContent.photos.slice(0, 3).map((photo, index) => (
                  <span key={photo.id} className="photo-preview-thumb">
                    <img
                      src={photo.src}
                      alt=""
                      loading="eager"
                      decoding="async"
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case "chat":
        if (activeYear === "2026") {
          return (
            <div className="grid-item-container story-grid-item">
              <div className="grid-item-text">
                <CardIcon name="story" locked={!isStoryPuzzleSolved} />
                <div className="story-preview-stack" aria-hidden="true">
                  <img src={storyPhotoOne} alt="" />
                  <img src={storyPhotoTwo} alt="" />
                </div>
                <p className="story-grid-kicker">2 НОВЫЕ ИСТОРИИ</p>
                <h3 className="text-lg font-bold mb-2">Истории</h3>
                <p className="text-xs">Нажми, чтобы посмотреть</p>
              </div>
            </div>
          );
        }
        return (
          <div className="grid-item-container chat-grid-item">
            <div className="grid-item-text">
              <CardIcon name="chat" />
              <h3 className="text-lg font-bold mb-2 chat-title">Переписка</h3>
              <p className="text-xs mb-3 chat-subtitle">Нажмите, чтобы открыть</p>
              <div className="chat-preview mb-3">
                <div className="message-bubble received mb-2">
                  <span className="message-text">Привет! ❤️</span>
                </div>
                <div className="message-bubble sent">
                  <span className="message-text">Привет! Как дела? ❤️</span>
                </div>
              </div>
              <div className="chat-stats">
                <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-chat-text me-1" viewBox="0 0 16 16">
                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" />
                    <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8zm0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z" />
                  </svg>
                  99+ сообщений
                </span>
              </div>
            </div>
          </div>
        );
      case "video":
        return (
          <div className="grid-item-container">

            {allSectionsVisited && (
              <div className="grid-item-text">
                <h3 className="text-lg font-bold mb-1">{item.label}</h3>
                <p className="text-xs mb-2">{item.description}</p>
                <button
                  className="btn btn-outline-light btn-sm rounded-pill px-3 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVideo(true);
                  }}
                >
                  Смотреть видео ❤️
                </button>
              </div>
            )}

          </div>
        );
      default:
        return (
          <div className="grid-item-container">
            <div className="grid-item-text">
              <span className="text-center">{item.label}</span>
            </div>
          </div>
        );
    }
  }, [activeYear, allSectionsVisited, isLetterPuzzleSolved, isStoryPuzzleSolved, yearContent]);

  // Consolidate all modal close functions
  const closeModal = useCallback(() => {
    setActiveItem(null);
    setShowLetter(false);
    setShowVideo(false);
    setSelectedPhoto(null);
    setStoryIndex(0);
    setModalType(null);
  }, []);

  const selectYear = useCallback((year) => {
    if (year === activeYear) return;
    closeModal();
    setActiveYear(year);
  }, [activeYear, closeModal]);

  const unlockAndOpenLetter = useCallback(() => {
    setPuzzlesSolvedByYear((previous) => {
      const solvedForYear = previous[activeYear] ?? new Set();
      return { ...previous, [activeYear]: new Set(solvedForYear).add('letter') };
    });
    markAsVisited('letter');
    setActiveItem(items.find((item) => item.type === 'letter'));
    setShowLetter(true);
    setModalType('letter');
  }, [activeYear, markAsVisited]);

  const unlockAndOpenStories = useCallback(() => {
    setPuzzlesSolvedByYear((previous) => {
      const solvedForYear = previous[activeYear] ?? new Set();
      return { ...previous, [activeYear]: new Set(solvedForYear).add('stories') };
    });
    markAsVisited('chat');
    setActiveItem(items.find((item) => item.type === 'chat'));
    setStoryIndex(0);
    setModalType('chat');
  }, [activeYear, markAsVisited]);

  return (
    <div className="love-experience">
      {/* Keep the dashboard mounted so every popup opens over the current chapter. */}
      <main className={`love-dashboard ${modalType ? "has-open-modal" : ""}`}>
          <nav className="year-switcher" aria-label="Выбрать год воспоминаний">
            {AVAILABLE_YEARS.map((year) => (
              <button
                type="button"
                key={year}
                className={`year-switcher__option ${year === activeYear ? "is-active" : ""}`}
                aria-pressed={year === activeYear}
                onClick={() => selectYear(year)}
              >
                <span>{year}</span>
                <small>{YEAR_DATA[year].label}</small>
              </button>
            ))}
          </nav>

          {yearContent.isTeaser ? (
            <section className="future-chapter" aria-label="Продолжение истории в 2027 году">
              <div className="future-chapter__orbit future-chapter__orbit--one" aria-hidden="true" />
              <div className="future-chapter__orbit future-chapter__orbit--two" aria-hidden="true" />
              <div className="future-chapter__content">
                <p>ГЛАВА {activeYear}</p>
                <h1>To be<br /><em>continued</em></h1>
                <div className="future-chapter__dots" aria-label="Продолжение следует">
                  <span />
                  <span />
                  <span />
                </div>
                <small>Самое красивое ещё впереди</small>
              </div>
              <span className="future-chapter__folio">{activeYear} / ∞</span>
            </section>
          ) : (
          <>
          <header className="dashboard-header">
            <div key={activeYear} className="year-heading">
              <p className="dashboard-kicker">{yearContent.kicker}</p>
              <h1>Всё, что хочется<br /><em>помнить всегда</em></h1>
            </div>
            <div className="dashboard-note" aria-label="Послание">
              <span>для тебя</span>
              <strong>с любовью</strong>
              <span aria-hidden="true">♥</span>
            </div>
          </header>

          <section key={activeYear} className="parent" aria-label={`Наши воспоминания за ${activeYear} год`}>
          {items.filter((item) => item.type !== "video").map((item) => (
            <button
              type="button"
              key={item.id}
              className={`${item.area} dashboard-card dashboard-card--${item.type}`}
              data-year={activeYear}
              onClick={(e) => {
                e.stopPropagation();
                // Close any open modals first
                closeModal();

                if (item.type === 'letter' && activeYear === '2026') {
                  markAsVisited(item.id);
                  setActiveItem(item);
                  setModalType('chat-wrapped');
                  return;
                }

                if (item.type === 'letter' && !isLetterPuzzleSolved) {
                  setActiveItem(item);
                  setModalType('kiss-game');
                  return;
                }

                if (item.type === 'chat' && activeYear === '2026' && !isStoryPuzzleSolved) {
                  setActiveItem(item);
                  setModalType('best-leva-game');
                  return;
                }

                if (item.type === 'timeline' && activeYear === '2026') {
                  markAsVisited(item.id);
                  setActiveItem(item);
                  setModalType('who-said-game');
                  return;
                }

                markAsVisited(item.id);

                // Handle each item type with its specific modal state
                switch (item.type) {
                  case "letter":
                    setShowLetter(true);
                    setActiveItem(item); // Add this line to ensure markAsVisited is called
                    setModalType('letter');
                    break;
                  case "map":
                    setActiveItem(item); // Add this line to ensure markAsVisited is called
                    setModalType('map');
                    break;
                  case "citation":
                    setActiveItem(item); // Add this line to ensure markAsVisited is called
                    setModalType('citation');
                    break;
                  case "video":
                    if (item.id === "text2") {
                      // Special video item
                      setActiveItem(item);
                      setModalType('video');
                    } else {
                      setShowVideo(true);
                      setActiveItem(item); // Add this line to ensure markAsVisited is called
                      setModalType('video');
                    }
                    break;
                  default:
                    // For chat, photos, timeline and other items
                    setActiveItem(item);
                    setModalType(item.type);
                    break;
                }
              }}
            >
              {renderItemContent(item)}
            </button>
          ))}

          {/* Special button that appears after visiting all sections */}
          <button
            type="button"
            className={`div7 dashboard-card dashboard-card--surprise ${allSectionsVisited ? 'special-surprise-available' : 'is-locked'
              }`}
            aria-disabled={!allSectionsVisited}
            onClick={(e) => {
              e.stopPropagation();
              if (allSectionsVisited) {
                // Close any open modals first
                closeModal();

                // Find the video item and activate it
                const videoItem = items.find(item => item.type === "video");
                if (videoItem) {
                  setActiveItem(videoItem);
                  setModalType('video');
                  setShowVideo(true); // Automatically show the video when opening the surprise
                }
              }
            }}
          >
            <div className="grid-item-container">
              <div className="grid-item-text">
                <div className="surprise-title-wrap">
                  <h3 className="text-lg font-bold mb-1">Специальный сюрприз</h3>
                  {!allSectionsVisited && <span className="surprise-lock" aria-hidden="true" />}
                </div>
                {allSectionsVisited ? (
                  <>
                    <p className="text-xs mb-2">Вы посетили все разделы</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs mb-2">Заблокировано</p>
                    <p className="text-xs">Посетите все разделы</p>
                    <div className="text-xs mt-2 opacity-75">
              {REQUIRED_SECTION_IDS.filter(section => !visitedItems.has(section)).length} осталось
                    </div>
                  </>
                )}
              </div>
            </div>
          </button>
          </section>

          <footer className="dashboard-footer">
            <span>{REQUIRED_SECTION_IDS.filter(section => visitedItems.has(section)).length} / {REQUIRED_SECTION_IDS.length} открыто</span>
            <div className="dashboard-progress" aria-hidden="true">
              <span style={{ width: `${REQUIRED_SECTION_IDS.filter(section => visitedItems.has(section)).length / REQUIRED_SECTION_IDS.length * 100}%` }} />
            </div>
            <span>{activeYear} · наша глава</span>
          </footer>
          </>
          )}
      </main>

      {/* FULLSCREEN VIDEO MODAL - Bootstrap Modal */}
      <Modal
        show={modalType === "video" && activeItem?.type === "video"}
        onHide={closeModal}
        fullscreen={true}
        backdrop="static"
        keyboard={false}
        className="citation-modal video-modal experience-fullscreen-modal"
        backdropClassName="bg-dark"
      >
        <Modal.Body className="citation-body p-0">
          <div className="citation-content h-100 d-flex align-items-center justify-content-center">
            {showVideo ? (
              <VideoScreen
                src={yearContent.surpriseVideo.src}
                poster={yearContent.surpriseVideo.poster}
                title={yearContent.surpriseVideo.title}
                onFinish={() => {
                  setShowVideo(false);
                  setModalType(null);
                }}
              />
            ) : (
              <div className="text-center video-placeholder w-100">
                <div className="display-1 mb-4">❤️</div>
                <h2 className="mb-3">Здесь будет твое видео</h2>
                <p className="mb-4 lead">Это место для твоего особенного видео-сюрприза!</p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowVideo(true)}
                  className="mt-3 rounded-pill px-4"
                >
                  Смотреть видео ❤️
                </Button>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* VIDEO SCREEN - Fullscreen */}
      {showVideo && !activeItem && (
        <VideoScreen
          src={yearContent.surpriseVideo.src}
          poster={yearContent.surpriseVideo.poster}
          title={yearContent.surpriseVideo.title}
          onFinish={() => {
            setShowVideo(false);
            setModalType(null);
          }}
        />
      )}

      <Modal
        show={modalType === "citation"}
        onHide={closeModal}
        fullscreen
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal experience-fullscreen-modal quote-fullscreen-modal"
      >
        <Modal.Header className="citation-header" closeButton>
          <Modal.Title className="w-100 text-center">
            <div className="modal-eyebrow">СЛОВА, КОТОРЫЕ ОСТАЛИСЬ</div>
            <div className="citation-title">Вечная мудрость</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="citation-body">
          <div className="citation-content">
            <blockquote className="citation-text">
              {yearContent.quote.text}
            </blockquote>
            <div className="citation-author">
              <div className="author-name">— {yearContent.quote.author}</div>
              <div className="author-era">{yearContent.quote.date}</div>
            </div>
            <div className="citation-decoration">
              <div className="decoration-element"></div>
              <div className="heart-icon">❤️</div>
              <div className="decoration-element"></div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* TELEGRAM WRAPPED FOR 2026 */}
      <Modal
        show={modalType === "chat-wrapped" && activeYear === "2026"}
        onHide={closeModal}
        fullscreen
        backdrop="static"
        keyboard={false}
        className="chat-wrapped-modal experience-fullscreen-modal"
      >
        <Modal.Body className="p-0 overflow-hidden">
          <ChatWrapped onClose={closeModal} />
        </Modal.Body>
      </Modal>

      {/* LETTER PUZZLE */}
      <Modal
        show={modalType === "kiss-game"}
        onHide={closeModal}
        fullscreen
        backdrop="static"
        className="kiss-game-modal citation-modal experience-fullscreen-modal"
      >
        <Modal.Header className="kiss-game-header" closeButton>
          <Modal.Title>
            <div className="modal-eyebrow">МИНИ-ИГРА · ГЛАВА {activeYear}</div>
            <div className="citation-title">Сначала поймай поцелуи</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="kiss-game-body">
          <KissCatchGame key={`${activeYear}-${modalType}`} onComplete={unlockAndOpenLetter} />
        </Modal.Body>
      </Modal>

      {/* LETTER MODAL - Bootstrap Modal */}
      <Modal
        show={modalType === "letter" && showLetter}
        onHide={closeModal}
        fullscreen
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal experience-fullscreen-modal letter-fullscreen-modal"
      >
        <Modal.Header className="letter-modal-header" closeButton>
          <Modal.Title className="w-100 text-center">
            <div className="modal-eyebrow">ЛИЧНОЕ ПИСЬМО</div>
            <div className="letter-modal-title">Любимая, для тебя</div>
            <div className="letter-modal-subtitle mt-2">С любовью от всей души</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="letter-modal-body">
          <div className="letter-modal-content">
            <div className="letter-paper">
              <div className="letter-header">
                <h2 className="letter-title">Моё самое дорогое письмо</h2>
                <div className="letter-date">{new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div className="letter-body">
                <p className="letter-salutation">Моя самая родная и любимая,</p>

                <p>Привет. Поздравляю с днем варенья, ой нет, с днем желенья, не не, с днем давления, ну это про тебя ну тоже нет, кароче с чем то, я думаю, что явно не буду первый так как для меня время уже спать, но все же, надеюсь ты это читаешь не в 8 утра, потому что явно я настолько ебануты что мог все проспать и  потом рано встать, так вот если - да, то советую ставить чайник так как явно я уже бегу к тебе, а может уже и под дверью, проверь не лижет ли там какой-то бомж(я).
                  Так к чему это я, хочу сказать что скоро тебе танометр не понадобиться, ну просто сомневаюсь что там будет такие цифры пока ты будешь учиться в мене. Хочется пожелать здоровья, а то как, у нас общего без секса не будет, ни детей, ни совместной жизни, так что крепись. Так же хочется пожелать меньше членов, и меньше так и просто по меньше, а то не гоже даме на них смотреть(возможно у чуть завидую, но все равно, где мои). И на добавку хочется скать что ты моя самая любимая и самая красивая девушка в мире. Я надеюсь ты дальше кайфанешь, ну а покаместь я прощаюсь с тобой </p>


                <p className="letter-signature">С безумной любовью,<br /><span className="signature-name">Лева</span></p>
                <div className="text-center mt-4">
                  <p style={{ fontSize: '2rem' }} className="heart-icon-letter">❤️</p>
                  <p className="mt-3" style={{ fontStyle: 'italic', color: '#d44d5c' }}>P.S. Не забудь удивиться, когда увидишь браслет — он символизирует наше бесконечное "я тебя люблю"</p>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* MAP MODAL - Bootstrap Modal */}
      <Modal
        show={modalType === "map"}
        onHide={closeModal}
        fullscreen
        backdropClassName="bg-dark bg-opacity-70"
        className="map-modal citation-modal experience-fullscreen-modal"
      >
        <Modal.Header className="map-header citation-header" closeButton>
          <Modal.Title className="w-100 text-center">
            <div className="modal-eyebrow">ГЕОГРАФИЯ НАШИХ ВОСПОМИНАНИЙ</div>
            <div className="map-title citation-title">Наша карта · {activeYear}</div>
            <div className="map-subtitle mt-2">Места, которые мы запомнили в этой главе</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="map-body citation-body">
          <div className="map-content citation-content">
            {yearContent.markers.length > 0 ? (
            <div className="map-frame">
              <div className="map-chapter-bar">
                <div>
                  <span>ГЛАВА {activeYear}</span>
                  <strong>{yearContent.markers.length} {yearContent.route ? 'точек маршрута' : 'памятных мест'}</strong>
                </div>
                <p>{yearContent.routeMeta || 'Нажми на фотографию, чтобы вспомнить историю точки'}</p>
              </div>
            <div className="map-container">
              <MapContainer
                center={[49, 32]}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewport markers={yearContent.markers} />
                {yearContent.route && (
                  <>
                    <Polyline
                      positions={yearContent.route}
                      pathOptions={{ color: '#fff8fb', weight: 10, opacity: 0.88, lineCap: 'round', lineJoin: 'round' }}
                    />
                    <Polyline
                      positions={yearContent.route}
                      pathOptions={{ color: '#c94f7c', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
                    />
                  </>
                )}
                {yearContent.markers.map((marker) => marker.photo ? (
                  <PhotoMarker
                    key={marker.id}
                    position={marker.position}
                    photo={marker.photo}
                    text={marker.text}
                  />
                ) : (
                  <RouteMarker key={marker.id} {...marker} />
                ))}
                {/* Add a decorative compass */}
                <div className="map-compass">🧭</div>
              </MapContainer>
            </div>
            </div>
            ) : (
              <div className="year-empty-state">
                <span className="year-empty-state__icon" aria-hidden="true">⌖</span>
                <p className="year-empty-state__eyebrow">ГЛАВА {activeYear}</p>
                <h3>Новые точки появятся здесь</h3>
                <p>{yearContent.mapEmptyText}</p>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={modalType === "timeline" && activeYear === "2025"}
        onHide={closeModal}
        fullscreen
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal experience-fullscreen-modal timeline-fullscreen-modal"
      >
        <Modal.Header className="citation-header" closeButton>
          <Modal.Title className="w-100 text-center">
            <div className="modal-eyebrow">ПО ГЛАВАМ И ДАТАМ</div>
            <div className="citation-title">Наша хронология · {activeYear}</div>
            <div className="citation-subtitle mt-2">История нашей любви</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="citation-body">
          <div className="citation-content">
            <div className="timeline-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="position-relative">
                {/* Timeline line */}
                <div className="position-absolute start-0 top-0 bottom-0 w-1 bg-danger bg-opacity-25 translate-middle-x" style={{ backgroundColor: 'black', marginLeft: '16px' }}></div>

                {/* Timeline events */}
                {yearContent.timeline.map((event, index) => (
                  <div key={event.id} className="d-flex mb-4 timeline-event-item">
                    <div className="d-flex flex-column align-items-center me-3 timeline-event-marker">
                      <div className="d-flex align-items-center justify-content-center rounded-circle bg-danger shadow timeline-event-number"
                        style={{ color: 'black', width: '45px', height: '45px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {index + 1}
                      </div>
                    </div>
                    <Card className="flex-grow-1 border-0 shadow-sm timeline-event-card">
                      <Card.Body className="py-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-0 timeline-event-title" style={{ color: 'black' }}>{event.title}</Card.Title>
                          <span className="badge bg-danger bg-opacity-10 timeline-event-date" style={{ color: 'black' }}>
                            {event.date}
                          </span>
                        </div>
                        <Card.Text className="mb-0 timeline-event-description" style={{ color: 'black' }}>{event.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              {/* Add decorative elements similar to citation modal */}
              <div className="citation-decoration mt-4">
                <div className="decoration-element"></div>
                <div className="heart-icon">❤️</div>
                <div className="decoration-element"></div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* INSTAGRAM-LIKE STORIES FOR 2026 */}
      <Modal
        show={modalType === "best-leva-game" && activeYear === "2026"}
        onHide={closeModal}
        fullscreen
        backdrop="static"
        keyboard={false}
        className="best-leva-modal experience-fullscreen-modal"
      >
        <Modal.Body className="best-leva-modal__body">
          <BestLevaGame onComplete={unlockAndOpenStories} onClose={closeModal} />
        </Modal.Body>
      </Modal>

      <Modal
        show={modalType === "chat" && activeYear === "2026"}
        onHide={closeModal}
        fullscreen
        backdropClassName="story-backdrop"
        className="story-modal experience-fullscreen-modal"
      >
        <Modal.Body className="story-modal-body">
          <article
            className="story-viewer"
            onTouchStart={(event) => { storyTouchStartX.current = event.changedTouches[0].clientX; }}
            onTouchEnd={(event) => {
              if (storyTouchStartX.current === null) return;
              const distance = event.changedTouches[0].clientX - storyTouchStartX.current;
              if (distance > 45) setStoryIndex(index => Math.max(0, index - 1));
              if (distance < -45) setStoryIndex(index => Math.min(storySlides.length - 1, index + 1));
              storyTouchStartX.current = null;
            }}
          >
            <img
              key={storySlides[storyIndex].id}
              className="story-image"
              src={storySlides[storyIndex].src}
              alt={`История ${storyIndex + 1}: ${storySlides[storyIndex].question}`}
            />
            <span className="story-image-shade" aria-hidden="true" />

            <div className="story-progress" aria-label={`История ${storyIndex + 1} из ${storySlides.length}`}>
              {storySlides.map((story, index) => (
                <button
                  type="button"
                  key={story.id}
                  className={index <= storyIndex ? "is-viewed" : ""}
                  onClick={() => setStoryIndex(index)}
                  aria-label={`Открыть историю ${index + 1}`}
                ><span /></button>
              ))}
            </div>

            <div className="story-user">
              <div className="story-avatar">Л</div>
              <strong>наша.история</strong>
              <span>сейчас</span>
            </div>

            <button type="button" className="story-close" onClick={closeModal} aria-label="Закрыть истории">×</button>
            <button
              type="button"
              className="story-tap-zone story-tap-zone--previous"
              onClick={() => setStoryIndex(index => Math.max(0, index - 1))}
              disabled={storyIndex === 0}
              aria-label="Предыдущая история"
            />
            <button
              type="button"
              className="story-tap-zone story-tap-zone--next"
              onClick={() => setStoryIndex(index => Math.min(storySlides.length - 1, index + 1))}
              disabled={storyIndex === storySlides.length - 1}
              aria-label="Следующая история"
            />

            <div className="story-poll">
              <p>{storySlides[storyIndex].question}</p>
              <div className="story-poll-options">
                {storySlides[storyIndex].options.map((option) => {
                  const selectedVote = storyVotes[storySlides[storyIndex].id];
                  const isSelected = selectedVote === option;
                  const percent = selectedVote ? (isSelected ? 86 : 14) : null;
                  return (
                    <button
                      type="button"
                      key={option}
                      className={isSelected ? "is-selected" : ""}
                      onClick={() => setStoryVotes(votes => ({ ...votes, [storySlides[storyIndex].id]: option }))}
                    >
                      {percent !== null && <span className="story-poll-fill" style={{ width: `${percent}%` }} />}
                      <strong>{option}</strong>
                      {percent !== null && <small>{percent}%</small>}
                    </button>
                  );
                })}
              </div>
              <small>{storyVotes[storySlides[storyIndex].id] ? "Голос учтён ♥" : "Выбери ответ"}</small>
            </div>

            <div className="story-reply">Ответить… <span>♡</span></div>
          </article>
        </Modal.Body>
      </Modal>

      {/* TELEGRAM-LIKE CHAT FOR 2025 */}
      <Modal
        show={modalType === "chat" && activeYear === "2025"}
        onHide={closeModal}
        fullscreen
        backdropClassName="bg-dark bg-opacity-50"
        className="enhanced-chat-modal telegram-chat experience-fullscreen-modal"
      >
        <Modal.Header className="chat-header" closeButton>
          <div className="chat-header-content w-100">
            <div className="chat-header-profile">
              <div className="chat-avatar chat-avatar--main">
                <span className="avatar-initials">Л</span>
                <i aria-hidden="true" />
              </div>
              <div>
                <h2 className="chat-username">Любимая</h2>
                <p className={`chat-status ${isTyping ? "is-typing" : ""}`}>
                  {isTyping ? "печатает…" : "была недавно"}
                </p>
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="chat-modal-body p-0">
          <div className="telegram-shell">
            <div className="chat-messages-container">
              <div className="chat-date-pill">26 ИЮНЯ 2025</div>
              {visibleMessages.map((msg) => (
                <div key={msg.id} className={`chat-message-row chat-message-row--${msg.author}`}>
                  {msg.author === "system" ? (
                    <div className="system-message">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`chat-bubble ${msg.author === "me" ? "sent" : "received"}`}>
                      <span className="message-text">{msg.text}</span>
                      <span className="message-meta">
                        {msg.time}
                        {msg.author === "me" && <span className="message-checks" aria-label="прочитано">✓✓</span>}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="chat-message-row chat-message-row--she">
                  <div className="typing-bubble" aria-label="Любимая печатает">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
              <button type="button" className="chat-tool-button" aria-label="Прикрепить файл">＋</button>
              <div className="chat-input-wrap">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Сообщение"
                />
                <span aria-hidden="true">♡</span>
              </div>
                <button type="button" className="send-button" aria-label="Отправить сообщение">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                  </svg>
                </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* PHOTO EXPLORER - Bootstrap Modal */}
      <Modal
        show={modalType === "who-said-game" && activeYear === "2026"}
        onHide={closeModal}
        fullscreen
        backdrop="static"
        className="who-said-modal citation-modal experience-fullscreen-modal"
      >
        <Modal.Header className="who-said-modal__header" closeButton>
          <Modal.Title>
            <div className="modal-eyebrow">МИНИ-ИГРА · АРХИВ ПЕРЕПИСКИ</div>
            <div className="citation-title">Кто из нас это написал?</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="who-said-modal__body">
          <WhoSaidItGame key={`${activeYear}-${modalType}`} onClose={closeModal} />
        </Modal.Body>
      </Modal>

      <Modal
        show={modalType === "photos"}
        onHide={closeModal}
        fullscreen
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal photo-modal experience-fullscreen-modal"
      >
        <Modal.Header className="photo-modal-header" closeButton>
          <Modal.Title className="w-100 text-center">
            <div className="modal-eyebrow">ЛИЧНЫЙ ФОТОАРХИВ</div>
            <div className="photo-modal-title">Наш фотоальбом · {activeYear}</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="photo-modal-body">
          <div className="citation-content">
            <div className="photo-gallery-header">
              <div>
                <span className="photo-gallery-index">КОЛЛЕКЦИЯ / {activeYear}</span>
                <h2 className="photo-gallery-title">Моменты без постановки</h2>
              </div>
              <p>{yearContent.photos.length} кадров<br />одной главы</p>
            </div>

            <div className="photo-gallery">
              {yearContent.photos.map((photo, index) => (
                <button
                  type="button"
                  className="photo-card"
                  key={photo.id}
                  onClick={() => setSelectedPhoto({ ...photo, index })}
                  aria-label={photo.name ? `Открыть «${photo.name}»` : `Открыть фотографию ${index + 1}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.name || `Фотография ${index + 1} за ${activeYear} год`}
                    className="photo-card-img"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                  <span className="photo-card-shade" aria-hidden="true" />
                  <span className={`photo-card-caption ${photo.name ? 'has-title' : 'is-untitled'}`}>
                    <small>КАДР {String(index + 1).padStart(2, '0')} / {activeYear}</small>
                    {photo.name && <strong>{photo.name}</strong>}
                  </span>
                </button>
              ))}
            </div>

            {selectedPhoto && (
              <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={selectedPhoto.name || `Фотография ${selectedPhoto.index + 1}`}>
                <button type="button" className="photo-lightbox__close" onClick={() => setSelectedPhoto(null)} aria-label="Закрыть фотографию">×</button>
                <img src={selectedPhoto.src} alt={selectedPhoto.name || `Фотография ${selectedPhoto.index + 1} за ${activeYear} год`} />
                <div className="photo-lightbox__caption">
                  <span>КАДР {String(selectedPhoto.index + 1).padStart(2, '0')} ИЗ {yearContent.photos.length}</span>
                  {selectedPhoto.name && <strong>{selectedPhoto.name}</strong>}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>


    </div>
  );
});

export default GridPage;
