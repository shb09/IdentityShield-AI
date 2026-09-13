import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Shield, ArrowLeft, Clock, FileText, User, AlertTriangle, CheckCircle, AlertCircle, ChevronRight, Loader2, Eye } from 'lucide-react';

export default function ScreeningResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('No screening ID'); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet(`/api/screening/${id}`);
        if (!res.ok) throw new Error(`Not found (${res.status})`);
        const result = await res.json();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-card)', borderTopColor: 'var(--accent)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--danger)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{error || 'No data'}</p>
          <button onClick={() => navigate('/')} className="btn-secondary mt-4 px-4 py-2 text-xs">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const risk = data.risk_assessment || {};
  const ocr = data.ocr_data || {};
  const tampering = data.tampering_analysis || {};
  const face = data.face_verification || {};
  const validation = data.document_validation || {};

  const riskColor = (data.risk_level || '').toUpperCase() === 'HIGH' ? 'var(--danger)' :
    (data.risk_level || '').toUpperCase() === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-200" style={{ color: 'var(--accent)' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Header */}
      <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${riskColor}10`, color: riskColor }}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Screening Result</h1>
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>#{(data.id || data.screening_id || '').slice(0, 12)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={data.risk_level} score={data.risk_score} size="lg" />
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-card)' }}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <FileText className="w-3.5 h-3.5" />
            {(data.document_type || 'unknown').replace('_', ' ').toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <Clock className="w-3.5 h-3.5" />
            {data.created_at ? new Date(data.created_at).toLocaleString() : 'Unknown'}
          </div>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <AlertTriangle className="w-4 h-4" style={{ color: riskColor }} /> Risk Assessment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl" style={{ background: 'var(--bg-input)' }}>
            <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Overall Risk</p>
            <p className="text-xl font-bold" style={{ color: riskColor }}>{Math.round(data.risk_score || 0)}/100</p>
          </div>
          <div className="p-3.5 rounded-xl" style={{ background: 'var(--bg-input)' }}>
            <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Risk Level</p>
            <RiskBadge level={data.risk_level} size="md" />
          </div>
        </div>
        {risk.factors && risk.factors.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Contributing Factors:</p>
            {risk.factors.map((f, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.08)' }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* OCR */}
        <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Extracted Data
          </h3>
          <div className="space-y-2.5">
            {ocr.name && <InfoRow label="Name" value={ocr.name} />}
            {ocr.nationality && <InfoRow label="Nationality" value={ocr.nationality} />}
            {ocr.document_number && <InfoRow label="Document No." value={ocr.document_number} />}
            {ocr.date_of_birth && <InfoRow label="DOB" value={ocr.date_of_birth} />}
            {ocr.expiry_date && <InfoRow label="Expiry" value={ocr.expiry_date} />}
          </div>
          {!ocr.name && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No OCR data extracted</p>}
        </div>

        {/* Validation */}
        <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle className="w-4 h-4" style={{ color: validation.is_valid ? 'var(--success)' : 'var(--danger)' }} />
            Document Validation
          </h3>
          <div className="space-y-2">
            <StatusRow label="Document Valid" status={validation.is_valid} />
            {validation.issues && validation.issues.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {validation.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.08)' }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{typeof issue === 'string' ? issue : issue.detail || JSON.stringify(issue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tampering */}
        <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Shield className="w-4 h-4" style={{ color: tampering.is_tampered ? 'var(--danger)' : 'var(--success)' }} />
            Tampering Detection
          </h3>
          <div className="space-y-2">
            <StatusRow label="Tampering Detected" status={!tampering.is_tampered} negative />
            {tampering.confidence !== undefined && (
              <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Confidence</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border-card)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(tampering.confidence || 0) * 100}%`, background: tampering.is_tampered ? 'var(--danger)' : 'var(--success)' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round((tampering.confidence || 0) * 100)}%</span>
                </div>
              </div>
            )}
            {tampering.details && tampering.details.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {tampering.details.map((d, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.08)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{typeof d === 'string' ? d : d.detail || JSON.stringify(d)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Face */}
        <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <User className="w-4 h-4" style={{ color: face.is_verified ? 'var(--success)' : 'var(--warning)' }} />
            Face Verification
          </h3>
          <div className="space-y-2">
            <StatusRow label="Face Verified" status={face.is_verified} />
            {face.similarity_score !== undefined && (
              <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Similarity Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border-card)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(face.similarity_score || 0) * 100}%`, background: 'var(--accent)' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round((face.similarity_score || 0) * 100)}%</span>
                </div>
              </div>
            )}
            {face.notes && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{face.notes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Image */}
      {data.document_image && (
        <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Eye className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Document Preview
          </h3>
          <div className="flex justify-center">
            <img src={data.document_image} alt="Scanned document" className="max-h-72 rounded-xl" style={{ border: '1px solid var(--border-card)' }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 pb-8">
        <Link to="/screening/new" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
          New Screening
        </Link>
        <Link to="/history" className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2">
          View History
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-input)' }}>
      <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function StatusRow({ label, status, negative }) {
  const isGood = negative ? !status : status;
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-input)' }}>
      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: isGood ? 'var(--success)' : 'var(--danger)' }}>
        {isGood ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
        {status ? 'Yes' : 'No'}
      </span>
    </div>
  );
}
