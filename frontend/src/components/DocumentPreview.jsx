import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Image } from 'lucide-react';

export default function DocumentPreview({ imageUrl, alt = 'Document', suspiciousRegions = [] }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageUrl) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    const img = new window.Image();
    img.onload = () => setLoading(false);
    img.onerror = () => { setLoading(false); setError(true); };
    img.src = imageUrl;
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
        <Image className="w-10 h-10 mb-2 opacity-20" style={{ color: 'var(--text-muted)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No document image</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--bg-input)' }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      )}
      {error ? (
        <div className="flex flex-col items-center justify-center h-48">
          <AlertCircle className="w-8 h-8 mb-2 opacity-30" style={{ color: 'var(--danger)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Failed to load image</p>
        </div>
      ) : (
        <div className="relative">
          <img src={imageUrl} alt={alt} className="w-full rounded-xl" style={{ display: loading ? 'none' : 'block' }} />
          {suspiciousRegions.map((region, i) => (
            <div key={i} className="absolute rounded border-2 border-dashed animate-pulse" style={{
              left: `${region.x || 0}%`, top: `${region.y || 0}%`,
              width: `${region.width || 10}%`, height: `${region.height || 10}%`,
              borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
