import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import StatusCard from '../components/StatusCard';
import DocumentPreview from '../components/DocumentPreview';
import { ArrowLeft, FileText, AlertTriangle, XCircle, Eye, Info, Download } from 'lucide-react';

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
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-24">
        <XCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error || 'Case not found'}</p>
        <button onClick={() => navigate('/history')} className="mt-4 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Back to History</button>
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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Screening Result</h1>
            {isDemo && <span className="px-2 py-0.5 text-[10px] font-bold rounded-md border" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', borderColor: 'var(--border-color)' }}>DEMO DATA</span>}
          </div>
          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{caseData.id}</p>
        </div>
      </div>

      {/* Risk Banner */}
      <div className={`rounded-2xl p-5 border ${
        risk.level === 'HIGH' ? 'border-rose-500/20' :
        risk.level === 'MEDIUM' ? 'border-amber-500/20' :
        'border-emerald-500/20'
      }`} style={{
        background: risk.level === 'HIGH' ? 'rgba(244, 63, 94, 0.08)' : risk.level === 'MEDIUM' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
      }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Overall Risk Assessment</p>
            <RiskBadge level={risk.level} score={risk.score} size="lg" />
          </div>
          <div className="text-right">
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Risk Score</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${
                risk.level === 'HIGH' ? 'text-rose-600' : risk.level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
              }`}>{risk.score}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>
        </div>

        {risk.reasons && risk.reasons.length > 0 && (
          <div className="mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Contributing Factors</p>
            <div className="space-y-1">
              {risk.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: 'var(--text-muted)' }} className="mt-0.5">•</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {risk.breakdown && (
          <div className="mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Score Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(risk.breakdown).map(([key, value]) => (
                <div key={key} className="rounded-xl p-3" style={{ background: 'var(--bg-input)' }}>
                  <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{key.replace(/_/g, ' ')}</p>
                  <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {/* Doc Info */}
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
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
                <div key={i} className="rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-input)' }}>
                  <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.value || 'Not detected'}</p>
                </div>
              ))}
            </div>
          </div>

          <StatusCard title="OCR Extraction" status={ocr.status === 'complete' ? 'PASS' : 'FAIL'} detail={`Confidence: ${ocr.confidence || 0}%`}>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
              <div className={`h-full rounded-full transition-all ${
                (ocr.confidence || 0) >= 70 ? 'bg-emerald-400' : (ocr.confidence || 0) >= 40 ? 'bg-amber-400' : 'bg-rose-400'
              }`} style={{ width: `${ocr.confidence || 0}%` }} />
            </div>
          </StatusCard>

          <StatusCard title="Document Validation" status={validation.status} detail={`Score: ${validation.score || 0}/100`}>
            <div className="space-y-1.5">
              {(validation.checks || []).map((check, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{check.check}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    check.status === 'PASS' ? 'bg-emerald-50 text-emerald-600' :
                    check.status === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>{check.status}</span>
                </div>
              ))}
            </div>
          </StatusCard>

          <StatusCard title="Tampering Detection" status={tampering.status} detail={`Risk Score: ${tampering.risk_score || 0}`}>
            <div className="space-y-1.5">
              {(tampering.explanations || []).map((exp, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-0.5" style={{ color: 'var(--text-muted)' }}>•</span>
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
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Document Image</h3>
            <DocumentPreview imageUrl={caseData.document_image_url} suspiciousRegions={suspiciousRegions} />
            {suspiciousRegions.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {suspiciousRegions.map((region, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-rose-600 bg-rose-50 rounded-xl px-3 py-2 border border-rose-100">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{region.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border shadow-sm p-5 space-y-2.5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-sm"
              style={{ background: 'var(--accent)' }}
            >
              <Download className="w-3.5 h-3.5" /> EXPORT REPORT
            </button>
            <button onClick={() => navigate('/screening/new')} className="w-full py-2.5 border font-medium rounded-xl transition-colors text-xs"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              New Screening
            </button>
          </div>

          <div className="rounded-2xl p-4 border" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.15)' }}>
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] leading-relaxed" style={{ color: '#f59e0b' }}>
                <strong>AI-assisted screening.</strong> Final decision remains with authorized personnel.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border p-4 text-[11px] space-y-0.5" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            <p>Screened: {new Date(caseData.created_at).toLocaleString('en-IN')}</p>
            {caseData.completed_at && <p>Completed: {new Date(caseData.completed_at).toLocaleString('en-IN')}</p>}
            <p className="font-mono">Case ID: {caseData.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
