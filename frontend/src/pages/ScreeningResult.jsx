import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Shield, ArrowLeft, Clock, FileText, User, AlertTriangle, CheckCircle, AlertCircle, Loader2, Eye } from 'lucide-react';

export default function ScreeningResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('No ID'); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const result = await apiGet(`/api/cases/${id}`);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 anim-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" style={{ color: 'var(--danger)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{error || 'Not found'}</p>
        <button onClick={() => navigate('/')} className="btn btn-ghost mt-3 px-4 py-1.5 text-xs inter">Back</button>
      </div>
    </div>
  );

  const risk = data.risk_assessment || {};
  const ocr = data.ocr_result?.fields || {};
  const tampering = data.tampering_result || {};
  const face = data.face_result || {};
  const validation = data.validation_result || {};

  const riskColor = (data.risk_level || '').toUpperCase() === 'HIGH' ? 'var(--danger)' :
    (data.risk_level || '').toUpperCase() === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="space-y-4 anim-fade-up max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[11px] font-medium inter" style={{ color: 'var(--accent)' }}>
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      {/* Header */}
      <div className="card p-5 relative overflow-hidden" style={{ background: 'var(--gradient-surface)' }}>
        <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: riskColor }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: riskColor, opacity: 0.9 }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Result</h1>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>#{(data.id || '').slice(0, 12)}</p>
            </div>
          </div>
          <RiskBadge level={data.risk_level} score={data.risk_score} size="md" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="badge badge-accent">{(data.document_type || '').replace('_', ' ').toUpperCase()}</span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3 h-3" /> {data.created_at ? new Date(data.created_at).toLocaleString() : '—'}
          </span>
        </div>
      </div>

      {/* Risk */}
      <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: riskColor }} /> Risk Assessment
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-input)' }}>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Score</p>
            <p className="text-xl font-bold" style={{ color: riskColor }}>{Math.round(data.risk_score || 0)}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-input)' }}>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Level</p>
            <RiskBadge level={data.risk_level} size="md" />
          </div>
        </div>
        {risk.reasons?.length > 0 && (
          <div className="space-y-1.5">
            {risk.reasons.map((f, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-[11px]" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.08)' }}>
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* OCR */}
        <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <FileText className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Extracted Data
          </h3>
          <div className="space-y-1.5">
            {ocr.name && <InfoRow label="Name" value={ocr.name} />}
            {ocr.nationality && <InfoRow label="Nationality" value={ocr.nationality} />}
            {ocr.document_number && <InfoRow label="Doc No." value={ocr.document_number} />}
            {ocr.date_of_birth && <InfoRow label="DOB" value={ocr.date_of_birth} />}
            {ocr.date_of_expiry && <InfoRow label="Expiry" value={ocr.date_of_expiry} />}
          </div>
          {!ocr.name && <p className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>No data extracted</p>}
        </div>

        {/* Validation */}
        <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: validation.status === 'PASS' ? 'var(--success)' : 'var(--danger)' }} />
            Validation
          </h3>
          <StatusRow label="Valid" status={validation.status === 'PASS'} />
          {validation.checks?.filter(c => c.status !== 'PASS').map((c, i) => (
            <div key={i} className="mt-1.5 px-2.5 py-1.5 rounded-lg text-[11px]" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.08)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{c.detail}</span>
            </div>
          ))}
        </div>

        {/* Tampering */}
        <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Shield className="w-3.5 h-3.5" style={{ color: tampering.status === 'PASS' ? 'var(--success)' : 'var(--warning)' }} />
            Tampering
          </h3>
          <StatusRow label="Clean" status={tampering.status === 'PASS'} />
          {tampering.risk_score > 0 && (
            <div className="mt-2 p-2.5 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${tampering.risk_score}%`, background: tampering.status === 'PASS' ? 'var(--success)' : 'var(--warning)' }} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(tampering.risk_score)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Face */}
        <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <User className="w-3.5 h-3.5" style={{ color: face.status === 'MATCH' ? 'var(--success)' : 'var(--warning)' }} />
            Face Verification
          </h3>
          <StatusRow label="Matched" status={face.status === 'MATCH'} />
          {face.similarity_score > 0 && (
            <div className="mt-2 p-2.5 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${face.similarity_score}%`, background: 'var(--accent)' }} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(face.similarity_score)}%</span>
              </div>
            </div>
          )}
          {face.explanation && <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>{face.explanation}</p>}
        </div>
      </div>

      {/* Image */}
      {(data.document_image_url || data.document_image) && (
        <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Document
          </h3>
          <div className="flex justify-center">
            <img src={data.document_image_url || `/api/uploads/documents/${data.document_image}`} alt=""
              className="max-h-64 rounded-xl" style={{ border: '1px solid var(--border)' }}
              onError={e => e.target.style.display = 'none'} />
          </div>
        </div>
      )}

      <div className="flex gap-2 pb-8">
        <Link to="/screening/new" className="btn btn-accent px-4 py-2 text-xs inter">New Screening</Link>
        <Link to="/history" className="btn btn-ghost px-4 py-2 text-xs inter">History</Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function StatusRow({ label, status }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
      <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: status ? 'var(--success)' : 'var(--danger)' }}>
        {status ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
        {status ? 'Yes' : 'No'}
      </span>
    </div>
  );
}
