// components/LoadingOverlay.tsx
import React from 'react';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent" />
    </div>
  );
}
