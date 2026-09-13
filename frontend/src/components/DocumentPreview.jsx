import React, { useState } from 'react';
import { Image, AlertCircle, Loader2 } from 'lucide-react';

export default function DocumentPreview({ imageUrl, suspiciousRegions = [] }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!imageUrl) {
    return (
      <div className="rounded-xl p-8 flex flex-col items-center justify-center" style={{ background: 'var(--bg-input)', border: '1px dashed var(--border-card)' }}>
        <Image className="w-10 h-10 mb-2" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No document image available</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>Upload a document to see it here</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      )}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8" style={{ color: 'var(--text-muted)' }}>
          <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-xs">Image could not be loaded</p>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="Document"
          className={`w-full h-auto object-contain max-h-80 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {suspiciousRegions.length > 0 && loaded && (
        <div className="absolute inset-0 pointer-events-none">
          {suspiciousRegions.map((region, i) => (
            <div
              key={i}
              className="absolute rounded"
              style={{
                left: `${(region.x / 600) * 100}%`,
                top: `${(region.y / 400) * 100}%`,
                width: `${(region.w / 600) * 100}%`,
                height: `${(region.h / 400) * 100}%`,
                border: '2px solid var(--danger)',
                background: 'rgba(244, 63, 94, 0.1)',
                boxShadow: '0 0 12px rgba(244, 63, 94, 0.3)',
              }}
            >
              <div className="absolute -top-5 left-0 text-white text-[9px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap" style={{ background: 'var(--danger)' }}>
                Suspicious #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
