import React from 'react';

const HorizontalLoader = () => {
  const colors = ['red', 'green', 'blue', 'white'];

  const loaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '5px',     
    marginBottom: '0px',
    height: '100%'         
  };

  const dotBaseStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    opacity: 0.3
  };

  const keyframes = colors.map((color, index) => `
    @keyframes fill-${index} {
      0%   { opacity: 0.3; background-color: lightgray; }
      50%  { opacity: 1; background-color: ${color}; }
      100% { opacity: 0.3; background-color: lightgray; }
    }
  `).join('\n');

  return (
    <>
      <style>{keyframes}</style>
      <div style={loaderStyle}>
        {colors.map((_, index) => (
          <span
            key={index}
            style={{
              ...dotBaseStyle,
              animation: `fill-${index} 1.6s infinite`,
              animationDelay: `${index * 0.2}s`
            }}
          />
        ))}
      </div>
    </>
  );
};

export default HorizontalLoader;
