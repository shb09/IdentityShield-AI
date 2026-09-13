import React from 'react';
import { Image, AlertCircle } from 'lucide-react';

export default function DocumentPreview({ imageUrl, suspiciousRegions = [] }) {
  if (!imageUrl) {
    return (
      <div className="rounded-2xl border border-dashed p-8 flex flex-col items-center justify-center" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
        <Image className="w-10 h-10 mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No document image available</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
      <img
        src={imageUrl}
        alt="Document"
        className="w-full h-auto object-contain max-h-80"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="hidden flex-col items-center justify-center p-8" style={{ color: 'var(--text-muted)' }}>
        <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs">Image could not be loaded</p>
      </div>

      {suspiciousRegions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {suspiciousRegions.map((region, i) => (
            <div
              key={i}
              className="absolute border-2 rounded"
              style={{
                left: `${(region.x / 600) * 100}%`,
                top: `${(region.y / 400) * 100}%`,
                width: `${(region.w / 600) * 100}%`,
                height: `${(region.h / 400) * 100}%`,
                borderColor: 'var(--accent)',
                background: 'var(--accent-bg)',
              }}
            >
              <div className="absolute -top-5 left-0 text-white text-[9px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap" style={{ background: 'var(--accent)' }}>
                Suspicious #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
