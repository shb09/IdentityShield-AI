import React from 'react';
import { Image, AlertCircle } from 'lucide-react';

export default function DocumentPreview({ imageUrl, suspiciousRegions = [] }) {
  if (!imageUrl) {
    return (
      <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-slate-400">
        <Image className="w-12 h-12 mb-2" />
        <p className="text-sm">No document image available</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden">
      <img
        src={imageUrl}
        alt="Document"
        className="w-full h-auto object-contain max-h-96"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="hidden flex-col items-center justify-center p-8 text-slate-400">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="text-sm">Image could not be loaded</p>
      </div>

      {/* Suspicious regions overlay */}
      {suspiciousRegions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {suspiciousRegions.map((region, i) => (
            <div
              key={i}
              className="absolute border-2 border-red-500 bg-red-500/10"
              style={{
                left: `${(region.x / 600) * 100}%`,
                top: `${(region.y / 400) * 100}%`,
                width: `${(region.w / 600) * 100}%`,
                height: `${(region.h / 400) * 100}%`,
              }}
            >
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                Suspicious #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
