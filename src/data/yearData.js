import firstPhoto from '../assets/optimized/first.jpg';
import thirdPhoto from '../assets/optimized/third.jpg';
import fourthPhoto from '../assets/optimized/fourth.jpg';
import secondPhoto from '../assets/optimized/second.jpg';
import fifthPhoto from '../assets/optimized/fifth.jpg';
import sixthPhoto from '../assets/optimized/sixth.jpg';
import absPhoto from '../assets/optimized/abs.jpg';
import momentPhoto from '../assets/optimized/moment.jpg';
import specialPhoto from '../assets/optimized/special.jpg';
import mapPhoto11 from '../assets/optimized/map/photo_2025-09-24_17-58-11.jpg';
import mapPhoto13 from '../assets/optimized/map/photo_2025-09-24_17-58-13.jpg';
import mapPhoto18 from '../assets/optimized/map/photo_2025-09-24_17-58-18.jpg';
import mapPhoto22 from '../assets/optimized/map/photo_2025-09-24_17-58-22.jpg';
import mapPhoto32 from '../assets/optimized/map/photo_2025-09-24_17-58-32.jpg';
import mapPhoto35 from '../assets/optimized/map/photo_2025-09-24_17-58-35.jpg';
import mapPhoto45 from '../assets/optimized/map/photo_2025-09-24_17-58-45.jpg';
import mapPhoto55 from '../assets/optimized/map/photo_2025-09-24_17-58-55.jpg';
import mapPhoto5903 from '../assets/optimized/map/photo_2025-09-24_17-59-03.jpg';
import mapPhoto0647 from '../assets/optimized/map/photo_2025-09-24_18-06-47.jpg';
import mapPhoto0701 from '../assets/optimized/map/photo_2025-09-24_18-07-01.jpg';

const photoModules2026 = import.meta.glob('../assets/years/2026-gallery/*.jpg', {
  eager: true,
  import: 'default',
});

const getPhotoTitle = (path) => {
  const sourceName = path.split('/').pop();
  const title = sourceName.replace(/\.[^.]+$/, '').trim();
  if (title === 'question-mark') return '?';
  return /^IMG[_\s-]*\d+$/i.test(title) ? '' : title;
};

const photos2026 = Object.entries(photoModules2026)
  .sort(([left], [right]) => left.localeCompare(right, 'ru', { numeric: true }))
  .map(([path, src], index) => ({
    id: `2026-photo-${index + 1}`,
    name: getPhotoTitle(path),
    src,
    sourceName: path.split('/').pop(),
    description: '',
  }));

const photos2025 = [
  { id: '2025-photo-1', name: 'Наш первый вечер', src: firstPhoto, description: '' },
  { id: '2025-photo-2', name: 'Один из моментов вместе', src: fifthPhoto, description: '' },
  { id: '2025-photo-3', name: 'Первое путешествие. Именно это фото заложило начало всему', src: thirdPhoto, description: '' },
  { id: '2025-photo-4', name: 'На закате', src: sixthPhoto, description: '' },
  { id: '2025-photo-5', name: 'Просто оставлю это здесь', src: absPhoto, description: '' },
  { id: '2025-photo-6', name: '2.0', src: fourthPhoto, description: '' },
  { id: '2025-photo-7', name: 'Особенный момент', src: momentPhoto, description: '' },
  { id: '2025-photo-8', name: 'Этот взгляд', src: secondPhoto, description: '' },
  { id: '2025-photo-9', name: 'Красавцы', src: specialPhoto, description: '' },
];

const markers2025 = [
  { id: 1, position: [49.978944, 36.256861], text: 'Наше первое совместное фото', photo: mapPhoto11 },
  { id: 2, position: [49.595257, 36.336346], text: 'Красавцы', photo: mapPhoto11 },
  { id: 3, position: [49.5947, 36.336627], text: 'Еще красавцы', photo: mapPhoto13 },
  { id: 4, position: [49.975804, 36.257101], text: 'Окунь', photo: mapPhoto18 },
  { id: 5, position: [49.975504, 36.257101], text: 'Пиздьож', photo: mapPhoto32 },
  { id: 6, position: [49.940117, 36.275532], text: 'Очаровательная и я', photo: mapPhoto35 },
  { id: 7, position: [49.595, 36.336234], text: 'Наше второе совместное фото', photo: mapPhoto22 },
  { id: 8, position: [49.999199, 36.224263], text: 'Довольная', photo: mapPhoto45 },
  { id: 9, position: [49.976062, 36.255201], text: 'Мы впервые как пара', photo: mapPhoto55 },
  { id: 10, position: [49.5947, 36.336227], text: 'Семейное фото', photo: mapPhoto5903 },
  { id: 11, position: [50.444273, 30.431027], text: 'Персик', photo: mapPhoto0647 },
  { id: 12, position: [50.444273, 30.431027], text: 'Горловой', photo: mapPhoto0701 },
];

const markers2026 = [
  { id: '2026-route-1', position: [49.9402533, 36.2752636], text: 'Улица Ньютона, 10', detail: 'Старт маршрута · Харьков', order: 1 },
  { id: '2026-route-2', position: [49.6944064, 36.3595476], text: 'Змиев', detail: 'Харьковская область', order: 2 },
  { id: '2026-route-3', position: [49.6596068, 36.3505935], text: 'Змиевские кручи', detail: 'Р78 · Змиев', order: 3 },
  { id: '2026-route-4', position: [49.757087, 36.1481561], text: 'Магазин, Тимченки', detail: 'Харьковская область', order: 4 },
  { id: '2026-route-5', position: [49.6217716, 36.1500116], text: 'Тарановка', detail: 'Харьковская область', order: 5 },
  { id: '2026-route-6', position: [49.3950005, 36.2154517], text: 'Златополь', detail: 'Харьковская область', order: 6 },
  { id: '2026-route-7', position: [49.836778, 36.0014446], text: 'Верхняя Озеряна', detail: 'Харьковская область', order: 7 },
  { id: '2026-route-8', position: [49.8060262, 36.0503448], text: 'Мерефа', detail: 'Харьковская область', order: 8 },
  { id: '2026-route-9', position: [49.9541962, 36.0966086], text: 'Песочин', detail: 'Харьковская область', order: 9 },
  { id: '2026-route-10', position: [50.0027694, 36.2251686], text: 'Харьковский зоопарк', detail: 'Финиш · улица Сумская, 35', order: 10 },
];

const timeline2025 = [
  { id: 1, date: '26.06.2025', title: 'Наша первая встреча', description: 'В этот день мы впервые встретились. И всё именно тут началось!' },
  { id: 2, date: '29.06.2025', title: 'Первый поцелуй', description: 'Под звездами в парке. Я помню это как вчера.' },
  { id: 3, date: '15.07.2025', title: 'Первые цветы', description: 'Эти краски я запомню на всю жизнь.' },
  { id: 4, date: '11.08.2025', title: 'Первая поездка', description: 'Наша первая совместная поездка. Именно с неё начались мы.' },
  { id: 5, date: '13.10.2025', title: 'День рождения', description: 'Наш первый день рождения вместе. Я тебя люблю.' },
];

export const YEAR_DATA = {
  2025: {
    year: '2025',
    label: 'С чего всё началось',
    kicker: 'ПЕРВАЯ ГЛАВА НАШЕЙ ИСТОРИИ',
    photos: photos2025,
    markers: markers2025,
    surpriseVideo: {
      src: '/videos/surprise-2025.mp4',
      poster: '/videos/surprise-2025-poster.jpg',
      title: 'Специальный сюрприз · 2025',
    },
    timeline: timeline2025,
    quote: {
      text: 'Расстояние само по себе ничего не значит. Оно становится испытанием: либо ты понимаешь, что любовь — лишь привычка, и тогда расстояние всё рушит, либо ты осознаёшь, что любовь — это глубже, чем привычка, и тогда никакие километры не в силах её убить.',
      author: 'Марк Аврелий',
      date: '245 до н.э.',
    },
    mapEmptyText: '',
  },
  2026: {
    year: '2026',
    label: 'Что добавилось сейчас',
    kicker: 'НАША ИСТОРИЯ ПРОДОЛЖАЕТСЯ',
    photos: photos2026,
    markers: markers2026,
    route: markers2026.map(({ position }) => position),
    routeMeta: '213 км · около 3 ч 54 мин',
    surpriseVideo: {
      src: '/videos/surprise-2026.mp4',
      poster: '/videos/surprise-2026-poster.jpg',
      title: 'Специальный сюрприз · 2026',
    },
    timeline: [
      {
        id: 1,
        date: '2026',
        title: 'Новая глава',
        description: 'Здесь будут появляться новые даты, поездки и важные моменты этого года.',
      },
    ],
    quote: {
      text: 'ДА У МЕНЯ НЕТ ГЛИСТОВ И ГЕМОРОЯ',
      author: 'Аптечка',
      date: '03.09.2026',
    },
    mapEmptyText: 'Новые места уже ждут своих координат',
  },
  2027: {
    year: '2027',
    label: 'Продолжение следует',
    kicker: 'СЛЕДУЮЩАЯ ГЛАВА',
    isTeaser: true,
    photos: [],
    markers: [],
    timeline: [],
    quote: {
      text: 'TO BE CONTINUED',
      author: 'Мы',
      date: '2027',
    },
    mapEmptyText: '',
  },
};

export const AVAILABLE_YEARS = Object.keys(YEAR_DATA).sort();
