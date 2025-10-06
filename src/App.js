import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loading from './components/Loading';

const Start = lazy(() => import('./components/Start'));
const TableScene = lazy(() => import('./components/TableScene'));
const PhotoTest = lazy(() => import('./components/PhotoTest'));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/table" element={<TableScene />} />
          <Route path="/phototest" element={<PhotoTest />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;