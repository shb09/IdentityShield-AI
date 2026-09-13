import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import StatusCard from '../components/StatusCard';
import DocumentPreview from '../components/DocumentPreview';
import { ArrowLeft, FileText, AlertTriangle, XCircle, Info, Download, ExternalLink } from 'lucide-react';

export default function ScreeningResult() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet(`/api/cases/${id}`)
      .then(data => setCaseData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border-card)', borderTopColor: 'var(--accent)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading case data...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-32 animate-fade-in">
        <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error || 'Case not found'}</p>
        <button onClick={() => navigate('/history')} className="btn-primary px-5 py-2.5 text-xs">
          Back to History
        </button>
      </div>
    );
  }

  const ocr = typeof caseData.ocr_result === 'string' ? JSON.parse(caseData.ocr_result) : (caseData.ocr_result || {});
  const validation = typeof caseData.validation_result === 'string' ? JSON.parse(caseData.validation_result) : (caseData.validation_result || {});
  const tampering = typeof caseData.tampering_result === 'string' ? JSON.parse(caseData.tampering_result) : (caseData.tampering_result || {});
  const face = typeof caseData.face_result === 'string' ? JSON.parse(caseData.face_result) : (caseData.face_result || {});
  const risk = typeof caseData.risk_result === 'string' ? JSON.parse(caseData.risk_result) : (caseData.risk_result || {});
  const fields = ocr.fields || {};
  const suspiciousRegions = tampering.suspicious_regions || [];
  const isDemo = caseData.demo_mode === true || caseData.demo_mode === 1;

  const riskColor = risk.level === 'HIGH' ? 'var(--danger)' : risk.level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="glass-card w-10 h-10 flex items-center justify-center transition-all duration-200" style={{ background: 'var(--bg-card)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Screening Result</h1>
            {isDemo && <span className="badge-info px-2.5 py-1 rounded-lg text-[10px] font-bold">DEMO DATA</span>}
          </div>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{caseData.id}</p>
        </div>
      </div>

      {/* Risk Banner */}
      <div className="glass-card p-6" style={{ borderLeft: `4px solid ${riskColor}`, background: 'var(--gradient-card)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Overall Risk Assessment</p>
            <RiskBadge level={risk.level} score={risk.score} size="lg" />
          </div>
          <div className="text-right">
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Risk Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: riskColor }}>{risk.score}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>
        </div>

        {risk.reasons && risk.reasons.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Contributing Factors</p>
            <div className="space-y-1.5">
              {risk.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5" style={{ color: 'var(--accent)' }}>•</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {risk.breakdown && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Score Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(risk.breakdown).map(([key, value]) => (
                <div key={key} className="rounded-xl p-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                  <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{key.replace(/_/g, ' ')}</p>
                  <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {/* Document Info */}
          <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Document Information
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Name', value: fields.name },
                { label: 'Document No.', value: fields.document_number },
                { label: 'Nationality', value: fields.nationality },
                { label: 'Date of Birth', value: fields.date_of_birth },
                { label: 'Expiry Date', value: fields.date_of_expiry },
                { label: 'Gender', value: fields.gender },
                { label: 'Issue Date', value: fields.issue_date },
                { label: 'Document Type', value: caseData.document_type?.replace('_', ' ').toUpperCase() },
              ].map((item, i) => (
                <div key={i} className="rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                  <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.value || 'Not detected'}</p>
                </div>
              ))}
            </div>
          </div>

          <StatusCard title="OCR Extraction" status={ocr.status === 'complete' ? 'PASS' : 'FAIL'} detail={`Confidence: ${ocr.confidence || 0}%`}>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{
                width: `${ocr.confidence || 0}%`,
                background: (ocr.confidence || 0) >= 70 ? 'var(--success)' : (ocr.confidence || 0) >= 40 ? 'var(--warning)' : 'var(--danger)',
              }} />
            </div>
          </StatusCard>

          <StatusCard title="Document Validation" status={validation.status} detail={`Score: ${validation.score || 0}/100`}>
            <div className="space-y-1.5">
              {(validation.checks || []).map((check, i) => (
                <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: i < (validation.checks || []).length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{check.check}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    check.status === 'PASS' ? 'badge-success' :
                    check.status === 'WARNING' ? 'badge-warning' : 'badge-danger'
                  }`}>{check.status}</span>
                </div>
              ))}
            </div>
          </StatusCard>

          <StatusCard title="Tampering Detection" status={tampering.status} detail={`Risk Score: ${tampering.risk_score || 0}`}>
            <div className="space-y-1.5">
              {(tampering.explanations || []).map((exp, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-0.5" style={{ color: 'var(--accent)' }}>•</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </StatusCard>

          <StatusCard title="Face Verification" status={face.status} detail={`Similarity: ${face.similarity_score || 0}%`}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{face.explanation}</p>
          </StatusCard>
        </div>

        <div className="space-y-4">
          {/* Document Image */}
          <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Document Image</h3>
            <DocumentPreview imageUrl={caseData.document_image_url} suspiciousRegions={suspiciousRegions} />
            {suspiciousRegions.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {suspiciousRegions.map((region, i) => (
                  <div key={i} className="badge-danger flex items-start gap-2 text-[11px] rounded-xl px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{region.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="glass-card p-5 space-y-2.5" style={{ background: 'var(--gradient-card)' }}>
            <button
              onClick={() => window.print()}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> EXPORT REPORT
            </button>
            <button onClick={() => navigate('/screening/new')} className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2">
              New Screening
            </button>
          </div>

          {/* Disclaimer */}
          <div className="glass-card px-4 py-3" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] leading-relaxed" style={{ color: '#f59e0b' }}>
                <strong>AI-assisted screening.</strong> Final decision remains with authorized personnel.
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="glass-card px-4 py-3 text-[11px] space-y-0.5" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
            <p>Screened: {new Date(caseData.created_at).toLocaleString('en-IN')}</p>
            {caseData.completed_at && <p>Completed: {new Date(caseData.completed_at).toLocaleString('en-IN')}</p>}
            <p className="font-mono">Case ID: {caseData.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
