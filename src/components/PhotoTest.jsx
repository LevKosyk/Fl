import React from 'react';
import photo11 from '../assets/optimized/map/photo_2025-09-24_17-58-11.jpg';
import photo13 from '../assets/optimized/map/photo_2025-09-24_17-58-13.jpg';
import photo18 from '../assets/optimized/map/photo_2025-09-24_17-58-18.jpg';
import photo22 from '../assets/optimized/map/photo_2025-09-24_17-58-22.jpg';
import photo32 from '../assets/optimized/map/photo_2025-09-24_17-58-32.jpg';
import photo35 from '../assets/optimized/map/photo_2025-09-24_17-58-35.jpg';
import photo38 from '../assets/optimized/map/photo_2025-09-24_17-58-38.jpg';
import photo45 from '../assets/optimized/map/photo_2025-09-24_17-58-45.jpg';
import photo55 from '../assets/optimized/map/photo_2025-09-24_17-58-55.jpg';
import photo5903 from '../assets/optimized/map/photo_2025-09-24_17-59-03.jpg';
import photo0647 from '../assets/optimized/map/photo_2025-09-24_18-06-47.jpg';
import photo0701 from '../assets/optimized/map/photo_2025-09-24_18-07-01.jpg';
import coverPhoto from '../assets/optimized/special.jpg';

const PhotoTest = () => {
  // List of all your photos
  const photos = [
    photo11,
    photo13,
    photo18,
    photo22,
    photo32,
    photo35,
    photo38,
    photo45,
    photo55,
    photo5903,
    photo0647,
    photo0701,
    coverPhoto,
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Photo Test Page</h1>
      <p>This page tests if all your photos are accessible.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {photos.map((photo, index) => (
          <div key={index} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', backgroundColor: 'white' }}>
            <h3>Photo {index + 1}</h3>
            <img 
              src={photo} 
              alt={`Тест ${index + 1}`}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
              onError={(e) => {
                e.target.src = 'https://placehold.co/300x200/cccccc/ffffff?text=Photo+Not+Found';
                e.target.alt = `Недоступно ${index + 1}`;
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>{photo}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoTest;
