import React, { useState, useEffect, useCallback, memo } from "react";
import "./styles/Table.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import VideoScreen from "./VideoScreen";
import { Modal, Button, Container, Row, Col, Card, CloseButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const items = [
  { id: "chat", label: "Переписка", type: "chat", area: "div1", bg: "bg-yellow-500" },
  { id: "photos", label: "Фотографии", type: "photos", area: "div2", bg: "bg-pink-500" },
  { id: "map", label: "Карта", type: "map", area: "div3", bg: "bg-green-500" },
  { id: "letter", label: "Письмо", type: "letter", area: "div4", bg: "bg-indigo-500" },
  { id: "timeline", label: "Хронология", type: "timeline", area: "div5", bg: "bg-red-500" },
  { id: "text", label: 'Расстояние само по себе ничего не значит. Оно становится испытанием: либо ты понимаешь, что любовь — лишь привычка, и тогда расстояние всё рушит, либо ты осознаёшь, что любовь — это глубже, чем привычка, и тогда никакие километры не в силах её убить.', author: "Марк Аврелий", year: "245 до н.э.", type: "citation", area: "div6", bg: "bg-blue-500" },
  { id: "text2", label: "Специальный сюрприз", description: "Нажми кнопку, чтобы увидеть кое-что особенное...", type: "video", area: "div7", bg: "bg-purple-500" },
];

const markers = [
  { id: 1, position: [49.978944, 36.256861], text: "Наше первое совместное фото", photo: "/assets/map/photo_2025-09-24_17-58-11.jpg" },
  { id: 2, position: [49.595257, 36.336346], text: "Красавцы", photo: "/assets/map/photo_2025-09-24_17-58-11.jpg" },
  { id: 3, position: [49.594700, 36.336627], text: "Еще красавцы", photo: "/assets/map/photo_2025-09-24_17-58-13.jpg" },
  { id: 4, position: [49.975804, 36.257101], text: "Окунь", photo: "/assets/map/photo_2025-09-24_17-58-18.jpg" },
  { id: 5, position: [49.975504, 36.257101], text: "Пиздьож", photo: "/assets/map/photo_2025-09-24_17-58-32.jpg" },
  { id: 6, position: [49.940117, 36.275532], text: "Очаровательная и я", photo: "/assets/map/photo_2025-09-24_17-58-35.jpg" },
  { id: 7, position: [49.595000, 36.336234], text: "Наше второе совместное фото", photo: "/assets/map/photo_2025-09-24_17-58-22.jpg" },
  { id: 8, position: [49.999199, 36.224263], text: "Довольная", photo: "../assets/map/photo_2025-09-24_17-58-45.jpg" },
  { id: 9, position: [49.976062, 36.255201], text: "Мы впервые как пара", photo: "/assets/map/photo_2025-09-24_17-58-55.jpg" },
  { id: 10, position: [49.594700, 36.336227], text: "Семейное фото", photo: "/assets/map/photo_2025-09-24_17-59-03.jpg" },
  { id: 11, position: [50.444273, 30.431027], text: "Персик", photo: "/assets/map/photo_2025-09-24_18-06-47.jpg" },
  { id: 12, position: [50.444273, 30.431027], text: "Горловой", photo: "/assets/map/photo_2025-09-24_18-07-01.jpg" },
];

// Photo marker component for displaying thumbnails directly on the map
const PhotoMarker = ({ position, photo, text }) => {
  // Create a custom icon with the photo thumbnail
  const createPhotoIcon = (photoUrl, text) => {
    return L.divIcon({
      className: 'enhanced-photo-marker',
      html: `
        <div class="enhanced-marker-container">
          <div class="marker-glow"></div>
          <img 
            src="${photoUrl}" 
            alt="${text}"
            class="enhanced-marker-image"
            onerror="this.src='https://placehold.co/60x60/cccccc/ffffff?text=📷'"
          />
          <div class="marker-heart">❤️</div>
        </div>
      `,
      iconSize: [70, 70],
      iconAnchor: [35, 35]
    });
  };

  // Create the photo icon
  const photoUrl = `../assets/map/${photo.split('/').pop()}`;
  const photoIcon = createPhotoIcon(photoUrl, text);

  return (
    <Marker position={position} icon={photoIcon}>
      <Popup className="enhanced-popup">
        <div class="popup-container">
          <div class="popup-header">
            <h3 class="popup-title">{text}</h3>
          </div>
          <div class="popup-image-container">
            <img
              src={photoUrl}
              alt={text}
              class="popup-image"
              onError={(e) => {
                e.target.src = 'https://placehold.co/200x150/cccccc/ffffff?text=Photo+Not+Found';
              }}
            />
          </div>
          <div class="popup-footer">
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

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


const photoData = [
  {
    id: "photo1",
    name: "Наш первый вечер",
    src: "/assets/First.JPG",
    description: ""
  },
  {
    id: "photo2",
    name: "Один из моментов вместе",
    src: "/assets/Fifs.JPG", 
    description: ""
  },
  {
    id: "photo3",
    name: "Первое путешествие. Именно это фото заложило начало всему",
    src: "/assets/Third.JPG",
    description: ""
  },
  {
    id: "photo4",
    name: "На закате",
    src: "/assets/Six.JPG",
    description: ""
  },
  {
    id: "photo5",
    name: "Просто оставлю это здесь",
    src: "/assets/abs.JPG",
    description: ""
  },
  {
    id: "photo6",
    name: "2.0",
    src: "/assets/Fours.JPG",
    description: ""
  },
  {
    id: "photo7",
    name: "Особенный момент",
    src: "/assets/photo_2025-10-05_16-58-10.jpg",
    description: ""
  },
  {
    id: "photo8",
    name: "Этот взгляд",
    src: "/assets/Second.PNG",
    description: ""
  },
  {
    id: "photo9",
    name: "Красавцы",
    src: "/assets/photo_2025-10-05_16-58-10.jpg",
    description: ""
  }
];

const timelineEvents = [
  { id: 1, date: "26.06.2025", title: "Наша первая встреча", description: "В этот день мы впервые встретились. И всё именно тут началось!" },
  { id: 2, date: "29.06.2025", title: "Первый поцелуй", description: "Под звездами в парке. Я помню это как вчера." },
  { id: 3, date: "15.07.2025", title: "Первые цветы", description: "Эти краски я запомню на всю жизнь." },
  { id: 4, date: "11.08.2025", title: "Первая поездка", description: "Наша первая совместная поездка. Именно с неё начались мы." },
  { id: 5, date: "13.10.2025", title: "День рождения", description: "Наш первый день рождения вместе. Я тебя люблю." },
  { id: 6, date: "--.--.2026", title: "Первое свидание", description: "Этот день когда-нибудь настанет." },
];

const GridPage = memo(() => {
  const [activeItem, setActiveItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // Track which modal is open
  const onClose = useCallback(() => {
    setIsOpen(false);
    setModalType(null);
  }, []);
  const onOpen = useCallback(() => {
    setIsOpen(true);
    setModalType('chat');
  }, []);
  const [open, setOpen] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  const [visibleMessages, setVisibleMessages] = useState([]);
  const [index, setIndex] = useState(0);

  const [stack, setStack] = useState([photoData]);
  const current = stack[stack.length - 1];

  const openItem = useCallback((item) => {
    if (item.type === "folder") {
      setStack([...stack, item.children]);
    }
  }, [stack]);

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      setStack(stack.slice(0, -1));
    } else {
      onClose();
    }
  }, [stack, onClose]);

  const [showVideo, setShowVideo] = useState(false);

  const [visitedItems, setVisitedItems] = useState(new Set());

  const allSections = ["chat", "photos", "map", "letter", "timeline"];

  const allSectionsVisited = allSections.every(section => visitedItems.has(section));

  const markAsVisited = useCallback((itemId) => {
    setVisitedItems(prev => new Set(prev).add(itemId));
  }, []);

  useEffect(() => {
    if (activeItem?.id === "chat" && isOpen) {
      setVisibleMessages([]);
      setIndex(0);

      let timeoutId;

      const showNextMessage = (currentIndex) => {
        if (currentIndex < chatMessages.length) {
          setVisibleMessages(prevMessages => {
            if (!prevMessages.some(msg => msg.id === chatMessages[currentIndex].id)) {
              console.log("Showing message:", chatMessages[currentIndex]);
              return [...prevMessages, chatMessages[currentIndex]];
            }
            return prevMessages;
          });

          timeoutId = setTimeout(() => {
            showNextMessage(currentIndex + 1);
          }, 2000);
        }
      };

      showNextMessage(0);

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [isOpen, activeItem, chatMessages.length]);

  useEffect(() => {
    if (activeItem && activeItem.id) {
      markAsVisited(activeItem.id);
    }
  }, [activeItem, markAsVisited]);

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
              <div className="text-2xl mb-1">❝</div>
              <blockquote className="italic text-xs mb-2 line-clamp-4">
                {item.label}
              </blockquote>
              <div className="text-right text-xs">
                <cite className="font-bold">— {item.author}</cite>
                <div>{item.year}</div>
              </div>
            </div>
          </div>
        );
      case "map":
        return (
          <div className="grid-item-container map-grid-item">
            <div className="grid-item-text">
              <div className="map-grid-icon mb-3">🗺️</div>
              <h3 className="text-lg font-bold mb-2 map-grid-title">Карта</h3>
              <p className="text-xs mb-3 map-grid-subtitle">Нажмите, чтобы открыть</p>
              <div className="map-stats-badge mt-3">
                <span className="badge bg-light text-dark">{markers.length} мест</span>
              </div>
            </div>
          </div>
        );
      case "timeline":
        return (
          <div className="grid-item-container">
            <div className="grid-item-text">
              <h3 className="text-lg font-bold mb-1">Хронология</h3>
              <p className="text-xs">Нажмите, чтобы открыть</p>
            </div>
          </div>
        );
      case "letter":
        return (
          <div className="grid-item-container letter-grid-item">
            <div className="grid-item-text">
              <div className="letter-grid-icon mb-3">💌</div>
              <h3 className="text-lg font-bold mb-2 letter-grid-title">{item.label}</h3>
              <p className="text-xs mb-3 letter-grid-subtitle">Нажми, чтобы открыть письмо</p>
              <div className="heart-grid-icon pulse-animation">❤️</div>
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="grid-item-container photo-grid-item">
            <div className="grid-item-text">
              <div className="photo-grid-icon mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-images" viewBox="0 0 16 16">
                  <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                  <path d="M6.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-7 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-1">Фотографии</h3>
              <p className="text-xs mb-2">Нажмите, чтобы открыть</p>
              <div className="photo-counter-badge">
                <span className="badge bg-light text-dark">{photoData.length} фото</span>
              </div>
              <div className="photo-preview-grid mt-2">
                {photoData.slice(0, 3).map((photo, index) => (
                  <div key={index} className="photo-preview-thumb" style={{
                    backgroundImage: `url(${photo.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                ))}
              </div>
            </div>
          </div>
        );
      case "chat":
        return (
          <div className="grid-item-container chat-grid-item">
            <div className="grid-item-text">
              <div className="chat-indicators mb-3 d-flex justify-content-center gap-2">
                <div className="indicator online"></div>
                <div className="indicator away"></div>
                <div className="indicator busy"></div>
              </div>
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
  }, [open, showVideo]);

  // Consolidate all modal close functions
  const closeModal = useCallback(() => {
    setActiveItem(null);
    setIsOpen(false);
    setShowCitation(false);
    setShowMap(false);
    setShowLetter(false);
    setShowVideo(false);
    setModalType(null);
  }, []);

  return (
    <div className="relative bg-gray-100 overflow-hidden">
      {/* GRID */}
      {!modalType && (
        <div className="parent" style={{ width: '100vw', height: '100vh' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`${item.area} flex items-center justify-center 
      text-white font-semibold rounded-xl cursor-pointer transition-all duration-300`}
              style={{ backgroundColor: item.bg }}
              onClick={(e) => {
                e.stopPropagation();
                // Close any open modals first
                closeModal();

                // Handle each item type with its specific modal state
                switch (item.type) {
                  case "letter":
                    setShowLetter(true);
                    setActiveItem(item); // Add this line to ensure markAsVisited is called
                    setModalType('letter');
                    break;
                  case "map":
                    setShowMap(true);
                    setActiveItem(item); // Add this line to ensure markAsVisited is called
                    setModalType('map');
                    break;
                  case "citation":
                    setShowCitation(true);
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
                    if (item.id === "chat") {
                      onOpen();
                    }
                    break;
                }
              }}
            >
              {renderItemContent(item)}
            </div>
          ))}

          {/* Special button that appears after visiting all sections */}
          <div
            className={`div7 flex items-center justify-center text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 ${allSectionsVisited ? 'special-surprise-available' : 'opacity-75'
              }`}
            style={{ gridArea: '1 / 3 / 3 / 4' }}
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
                <h3 className="text-lg font-bold mb-1">🎉 Специальный сюрприз</h3>
                {allSectionsVisited ? (
                  <>
                    <p className="text-xs mb-2">Вы посетили все разделы</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs mb-2">Заблокировано</p>
                    <div className="lock-icon mb-2">🔒</div>
                    <p className="text-xs">Посетите все разделы</p>
                    <div className="text-xs mt-2 opacity-75">
                      {allSections.filter(section => !visitedItems.has(section)).length} осталось
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN VIDEO MODAL - Bootstrap Modal */}
      <Modal
        show={modalType === "video" && activeItem?.type === "video"}
        onHide={closeModal}
        fullscreen={true}
        backdrop="static"
        keyboard={false}
        className="citation-modal"
        backdropClassName="bg-dark"
      >
        <Modal.Header className="citation-header" closeButton>
          <Modal.Title className="text-white w-100 text-center">
            <div className="citation-icon">🎬</div>
            <div className="citation-title">Специальный сюрприз</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="citation-body p-0">
          <div className="citation-content h-100 d-flex align-items-center justify-content-center">
            {showVideo ? (
              <VideoScreen
                src="/assets/IMG_2424.mp4"
                onFinish={() => {
                  setShowVideo(false);
                  setModalType(null);
                }}
              />
            ) : (
              <div className="text-center text-white w-100">
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
        <Modal.Footer className="citation-footer">
          <Button
            variant="outline-light"
            onClick={closeModal}
            className="rounded-pill px-4"
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* VIDEO SCREEN - Fullscreen */}
      {showVideo && !activeItem && (
        <VideoScreen
          src="/assets/IMG_2424.mp4"
          onFinish={() => {
            setShowVideo(false);
            setModalType(null);
          }}
        />
      )}

      <Modal
        show={modalType === "citation"}
        onHide={closeModal}
        centered
        size="lg"
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal"
      >
        <Modal.Header className="bg-gradient citation-header" closeButton>
          <Modal.Title className="text-white w-100 text-center">
            <div className="citation-icon">❝</div>
            <div className="citation-title">Вечная мудрость</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="citation-body">
          <div className="citation-content">
            <blockquote className="citation-text">
              {items.find(item => item.id === "text")?.label}
            </blockquote>
            <div className="citation-author">
              <div className="author-name">— {items.find(item => item.id === "text")?.author}</div>
              <div className="author-era">{items.find(item => item.id === "text")?.year}</div>
            </div>
            <div className="citation-decoration">
              <div className="decoration-element"></div>
              <div className="heart-icon">❤️</div>
              <div className="decoration-element"></div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="citation-footer">
          <Button
            variant="outline-light"
            onClick={closeModal}
            className="rounded-pill px-4"
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* LETTER MODAL - Bootstrap Modal */}
      <Modal
        show={modalType === "letter" && showLetter}
        onHide={closeModal}
        size="lg"
        centered
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal"
      >
        <Modal.Header className="letter-modal-header" closeButton>
          <Modal.Title className="text-white w-100 text-center">
            <div className="letter-modal-icon">💌</div>
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
        <Modal.Footer className="letter-modal-footer">
          <Button
            variant="outline-light"
            onClick={closeModal}
            className="rounded-pill px-4"
          >
            Свернуть письмо
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MAP MODAL - Bootstrap Modal */}
      <Modal
        show={modalType === "map"}
        onHide={closeModal}
        size="xl"
        centered
        backdropClassName="bg-dark bg-opacity-70"
        className="map-modal citation-modal"
      >
        <Modal.Header className="map-header citation-header" closeButton>
          <Modal.Title className="text-white w-100 text-center">
            <div className="map-icon citation-icon">🗺️</div>
            <div className="map-title citation-title">Наша карта</div>
            <div className="map-subtitle mt-2">Места, которые мы запомнили вместе</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="map-body citation-body">
          <div className="map-content citation-content">
            <div className="map-container" style={{ height: "75vh", width: "100%", borderRadius: "15px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
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
                {/* Photo thumbnails displayed directly on the map */}
                {markers.map((m) => (
                  <PhotoMarker
                    key={m.id}
                    position={m.position}
                    photo={m.photo}
                    text={m.text}
                  />
                ))}
                {/* Add a decorative compass */}
                <div className="map-compass">🧭</div>
              </MapContainer>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="map-footer citation-footer">
          <Button
            variant="outline-light"
            onClick={closeModal}
            className="rounded-pill px-4 map-close-btn"
          >
            Закрыть карту
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={modalType === "timeline"}
        onHide={closeModal}
        size="lg"
        centered
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal"
      >
        <Modal.Header className="citation-header" closeButton>
          <Modal.Title className="text-white w-100 text-center">
            <div className="citation-icon">⏳</div>
            <div className="citation-title">Наша Хронология</div>
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
                {timelineEvents.map((event, index) => (
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
        <Modal.Footer className="citation-footer">
          <Button
            variant="outline-light"
            onClick={closeModal}
            className="rounded-pill px-4"
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CHAT MODAL - Bootstrap Modal */}
      <Modal
        show={modalType === "chat"}
        onHide={closeModal}
        size="lg"
        centered
        backdropClassName="bg-dark bg-opacity-50"
        className="enhanced-chat-modal"
      >
        <Modal.Header className="chat-header" closeButton>
          <div className="chat-header-content w-100">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="chat-avatar sent me-3">
                  <span className="avatar-initials">Л</span>
                </div>
                <div>
                  <h2 className="chat-username mb-0">Любимая</h2>
                  <p className="chat-status mb-0">Онлайн</p>
                </div>
              </div>
              <div className="chat-icon">💬</div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="chat-modal-body p-0">
          <div className="d-flex flex-column h-100">
            {/* Chat messages container */}
            <div className="flex-grow-1 overflow-auto p-3 chat-messages-container" style={{ maxHeight: '60vh' }}>
              {visibleMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`mb-3 chat-message ${msg.author === "system" ? "text-center" : ""}`}
                >
                  {msg.author === "system" ? (
                    // System message
                    <div className="d-inline-block p-2 rounded system-message">
                      {msg.text}
                    </div>
                  ) : (
                    // Regular chat message
                    <div
                      className={`d-flex ${msg.author === "me" ? "justify-content-end" : "justify-content-start"}`}
                    >
                      {msg.author === "she" && (
                        <div className="avatar me-2 d-flex align-items-end">
                          <div className="chat-avatar received">
                            <span className="avatar-initials">Л</span>
                          </div>
                        </div>
                      )}
                      <div
                        className={`p-3 rounded chat-bubble ${msg.author === "me"
                          ? "sent"
                          : "received"
                          }`}
                      >
                        <div className="message-text">{msg.text}</div>
                        <div className={`text-end small mt-1 message-time ${msg.author === "me" ? "sent-time" : "received-time"
                          }`}>
                          {msg.time}
                        </div>
                      </div>
                      {msg.author === "me" && (
                        <div className="avatar ms-2 d-flex align-items-end">
                          <div className="chat-avatar sent">
                            <span className="avatar-initials">Я</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat input area */}
            <div className="chat-input-area">
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control chat-input flex-grow-1"
                  placeholder="Написать сообщение..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Simulate sending a message
                      console.log("Message sent");
                    }
                  }}
                />
                <button className="btn btn-primary send-button d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="citation-footer">
          <Button
            variant="outline-light"
            onClick={closeModal}
            className="rounded-pill px-4"
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* PHOTO EXPLORER - Bootstrap Modal */}
      <Modal
        show={modalType === "photos"}
        onHide={closeModal}
        size="xl"
        centered
        backdropClassName="bg-dark bg-opacity-50"
        className="citation-modal photo-modal"
      >
        <Modal.Header className="photo-modal-header" closeButton>
          <Modal.Title className="text-white w-100 text-center">
            <div className="photo-modal-icon">📸</div>
            <div className="photo-modal-title">Наш Фотоальбом</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="photo-modal-body">
          <div className="citation-content">
            <div className="photo-gallery-header mb-4">
              <h2 className="photo-gallery-title">Наш Фотоальбом</h2>
              <p className="text-white mb-3 opacity-75">Воспоминания, которые мы создали вместе</p>
              <div className="photo-gallery-stats">
                <span className="photo-count-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-images" viewBox="0 0 16 16">
                    <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                    <path d="M6.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-7 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                  {photoData.length} фотографий
                </span>
              </div>
            </div>

            <div className="photo-gallery">
              <Row>
                {photoData.map((photo, index) => (
                  <Col md={4} className="mb-4" key={photo.id}>
                    <Card className="h-100 shadow-sm photo-card">
                      <div className="photo-card-image-wrapper">
                        <Card.Img
                          variant="top"
                          src={photo.src}
                          alt={photo.name}
                          className="photo-card-img"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/300x250/cccccc/ffffff?text=Фото+не+найдено';
                          }}
                        />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="photo-card-title">{photo.name}</Card.Title>
                        <Card.Text className="flex-grow-1 photo-card-description">{photo.description}</Card.Text>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <small className="text-white opacity-75">Фото #{index + 1}</small>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="photo-modal-footer">
          <div className="photo-modal-footer-content">
            <div className="photo-stats">
              <span className="text-white opacity-75">
                <span className="fw-bold">{photoData.length}</span> фотографий в альбоме
              </span>
            </div>
            <div className="photo-modal-actions">
              <Button
                variant="outline-light"
                className="me-2 rounded-pill px-4 photo-action-btn"
                onClick={closeModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.146 5.147a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                </svg>
                Закрыть
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>


    </div>
  );
});

export default GridPage;