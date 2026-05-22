import React from 'react';

const HorizontalLoader = () => {
  const colors = ['#4f8aff', '#3dd68c', '#a78bfa', '#ffd93d'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', marginBottom: '0px', height: '100%' }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.3,
            animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default HorizontalLoader;
