import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import StatusCard from '../components/StatusCard';
import DocumentPreview from '../components/DocumentPreview';
import { ArrowLeft, FileText, AlertTriangle, XCircle, Eye, Info } from 'lucide-react';

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
        <div className="w-7 h-7 border-2 border-indigo-200 border-t-[#6366f1] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-24">
        <XCircle className="w-10 h-10 text-rose-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">{error || 'Case not found'}</p>
        <button onClick={() => navigate('/history')} className="mt-4 text-xs text-[#6366f1] hover:text-indigo-500 font-semibold">Back to History</button>
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
  const isDemo = caseData.demo_mode === 1;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Screening Result</h1>
            {isDemo && <span className="px-2 py-0.5 bg-indigo-50 text-[#6366f1] text-[10px] font-bold rounded-md border border-indigo-100">DEMO DATA</span>}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{caseData.id}</p>
        </div>
      </div>

      {/* Risk Banner */}
      <div className={`rounded-2xl p-5 border ${
        risk.level === 'HIGH' ? 'bg-rose-50 border-rose-100' :
        risk.level === 'MEDIUM' ? 'bg-amber-50 border-amber-100' :
        'bg-emerald-50 border-emerald-100'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Overall Risk Assessment</p>
            <RiskBadge level={risk.level} score={risk.score} size="lg" />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 mb-0.5">Risk Score</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${
                risk.level === 'HIGH' ? 'text-rose-600' : risk.level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
              }`}>{risk.score}</span>
              <span className="text-sm text-slate-300">/100</span>
            </div>
          </div>
        </div>

        {risk.reasons && risk.reasons.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-current/10">
            <p className="text-xs font-semibold text-slate-600 mb-2">Contributing Factors</p>
            <div className="space-y-1">
              {risk.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-300 mt-0.5">•</span>
                  <span className="text-xs text-slate-500">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {risk.breakdown && (
          <div className="mt-4 pt-3.5 border-t border-current/10">
            <p className="text-xs font-semibold text-slate-600 mb-3">Score Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(risk.breakdown).map(([key, value]) => (
                <div key={key} className="bg-white/70 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-base font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {/* Doc Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#6366f1]" /> Document Information
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
                <div key={i} className="bg-slate-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-slate-400 mb-0.5">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-600">{item.value || 'Not detected'}</p>
                </div>
              ))}
            </div>
          </div>

          <StatusCard title="OCR Extraction" status={ocr.status === 'complete' ? 'PASS' : 'FAIL'} detail={`Confidence: ${ocr.confidence || 0}%`}>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                (ocr.confidence || 0) >= 70 ? 'bg-emerald-400' : (ocr.confidence || 0) >= 40 ? 'bg-amber-400' : 'bg-rose-400'
              }`} style={{ width: `${ocr.confidence || 0}%` }} />
            </div>
          </StatusCard>

          <StatusCard title="Document Validation" status={validation.status} detail={`Score: ${validation.score || 0}/100`}>
            <div className="space-y-1.5">
              {(validation.checks || []).map((check, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{check.check}</span>
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
                <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                  <span className="text-slate-300 mt-0.5">•</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </StatusCard>

          <StatusCard title="Face Verification" status={face.status} detail={`Similarity: ${face.similarity_score || 0}%`}>
            <p className="text-xs text-slate-500">{face.explanation}</p>
          </StatusCard>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Document Image</h3>
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

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2.5">
            <button className="w-full py-2.5 bg-[#6366f1] hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-sm shadow-indigo-500/20">
              <Eye className="w-3.5 h-3.5" /> REVIEW CASE
            </button>
            <button onClick={() => navigate('/screening/new')} className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-colors text-xs">
              New Screening
            </button>
          </div>

          <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                <strong>AI-assisted screening.</strong> Final decision remains with authorized personnel.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-[11px] text-slate-400 space-y-0.5">
            <p>Screened: {new Date(caseData.created_at).toLocaleString('en-IN')}</p>
            {caseData.completed_at && <p>Completed: {new Date(caseData.completed_at).toLocaleString('en-IN')}</p>}
            <p className="font-mono">Case ID: {caseData.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
