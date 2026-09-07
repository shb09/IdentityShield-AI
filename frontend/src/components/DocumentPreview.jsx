import React from 'react';
import { Image, AlertCircle } from 'lucide-react';

export default function DocumentPreview({ imageUrl, suspiciousRegions = [] }) {
  if (!imageUrl) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center text-gray-400">
        <Image className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-xs">No document image available</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 rounded-2xl border border-indigo-100/50 overflow-hidden">
      <img
        src={imageUrl}
        alt="Document"
        className="w-full h-auto object-contain max-h-80"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="hidden flex-col items-center justify-center p-8 text-gray-400">
        <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs">Image could not be loaded</p>
      </div>

      {suspiciousRegions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {suspiciousRegions.map((region, i) => (
            <div
              key={i}
              className="absolute border-2 border-indigo-400 bg-indigo-400/10 rounded"
              style={{
                left: `${(region.x / 600) * 100}%`,
                top: `${(region.y / 400) * 100}%`,
                width: `${(region.w / 600) * 100}%`,
                height: `${(region.h / 400) * 100}%`,
              }}
            >
              <div className="absolute -top-5 left-0 bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">
                Suspicious #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
