import React from 'react';

const PhotoTest = () => {
  // List of all your photos
  const photos = [
    "assets/map/photo_2025-09-24_17-58-11.jpg",
    "assets/map/photo_2025-09-24_17-58-13.jpg",
    "assets/map/photo_2025-09-24_17-58-18.jpg",
    "assets/map/photo_2025-09-24_17-58-22.jpg",
    "assets/map/photo_2025-09-24_17-58-32.jpg",
    "assets/map/photo_2025-09-24_17-58-35.jpg",
    "assets/map/photo_2025-09-24_17-58-38.jpg",
    "assets/map/photo_2025-09-24_17-58-45.jpg",
    "assets/map/photo_2025-09-24_17-58-55.jpg",
    "assets/map/photo_2025-09-24_17-59-03.jpg",
    "assets/map/photo_2025-09-24_18-06-47.jpg",
    "assets/map/photo_2025-09-24_18-07-01.jpg",
    "/photo_2025-09-07_19-21-27.jpg"
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
              alt={`Test photo ${index + 1}`} 
              style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
              onError={(e) => {
                e.target.src = 'https://placehold.co/300x200/cccccc/ffffff?text=Photo+Not+Found';
                e.target.alt = `Photo ${index + 1} not found`;
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