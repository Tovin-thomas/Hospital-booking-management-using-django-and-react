import React from 'react';

const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-md" style={{ padding: '2rem' }}>
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default Loading;
