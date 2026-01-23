import React from 'react';

type AtlasToastProps = {
  message: string | null;
};

export const AtlasToast: React.FC<AtlasToastProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs px-4 py-2 rounded-full shadow-float">
      {message}
    </div>
  );
};
