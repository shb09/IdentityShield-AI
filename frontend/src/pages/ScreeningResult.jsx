import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import StatusCard from '../components/StatusCard';
import DocumentPreview from '../components/DocumentPreview';
import {
  ArrowLeft, FileText, User, Shield, AlertTriangle,
  CheckCircle, XCircle, Clock, Eye, Download, Info
} from 'lucide-react';

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
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-20">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-600">{error || 'Case not found'}</p>
        <button onClick={() => navigate('/history')} className="mt-4 text-sm text-navy-600 hover:text-navy-800 font-medium">
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

  const isDemo = caseData.demo_mode === 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">Screening Result</h1>
              {isDemo && (
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-200">
                  DEMO / SYNTHETIC DATA
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Case ID: {caseData.id}</p>
          </div>
        </div>
      </div>

      {/* Risk Score Banner */}
      <div className={`rounded-2xl p-6 border-2 ${
        risk.level === 'HIGH' ? 'bg-red-50 border-red-200' :
        risk.level === 'MEDIUM' ? 'bg-amber-50 border-amber-200' :
        'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Overall Risk Assessment</p>
            <RiskBadge level={risk.level} score={risk.score} size="lg" />
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Risk Score</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold ${
                risk.level === 'HIGH' ? 'text-red-600' :
                risk.level === 'MEDIUM' ? 'text-amber-600' :
                'text-emerald-600'
              }`}>{risk.score}</span>
              <span className="text-lg text-slate-400">/100</span>
            </div>
          </div>
        </div>

        {/* Reasons */}
        {risk.reasons && risk.reasons.length > 0 && (
          <div className="mt-4 pt-4 border-t border-current/10">
            <p className="text-sm font-semibold text-slate-700 mb-2">Contributing Factors:</p>
            <div className="space-y-1">
              {risk.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span className="text-sm text-slate-600">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown */}
        {risk.breakdown && (
          <div className="mt-4 pt-4 border-t border-current/10">
            <p className="text-sm font-semibold text-slate-700 mb-3">Score Breakdown:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(risk.breakdown).map(([key, value]) => (
                <div key={key} className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-slate-500 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-lg font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Document Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-navy-600" />
              Document Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
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
                <div key={i} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-slate-700">{item.value || 'Not detected'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Results */}
          <StatusCard
            title="OCR Extraction"
            status={ocr.status === 'complete' ? 'PASS' : 'FAIL'}
            detail={`Confidence: ${ocr.confidence || 0}%`}
          >
            <div className="space-y-2">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    (ocr.confidence || 0) >= 70 ? 'bg-emerald-500' :
                    (ocr.confidence || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${ocr.confidence || 0}%` }}
                />
              </div>
            </div>
          </StatusCard>

          <StatusCard
            title="Document Validation"
            status={validation.status}
            detail={`Score: ${validation.score || 0}/100`}
          >
            <div className="space-y-2">
              {(validation.checks || []).map((check, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-600">{check.check}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    check.status === 'PASS' ? 'bg-emerald-50 text-emerald-600' :
                    check.status === 'WARNING' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>{check.status}</span>
                </div>
              ))}
            </div>
          </StatusCard>

          <StatusCard
            title="Tampering Detection"
            status={tampering.status}
            detail={`Risk Score: ${tampering.risk_score || 0}`}
          >
            <div className="space-y-2">
              {(tampering.explanations || []).map((exp, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </StatusCard>

          <StatusCard
            title="Face Verification"
            status={face.status}
            detail={`Similarity: ${face.similarity_score || 0}%`}
          >
            <p className="text-sm text-slate-600">{face.explanation}</p>
          </StatusCard>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Document Image */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Document Image</h3>
            <DocumentPreview
              imageUrl={caseData.document_image_url}
              suspiciousRegions={suspiciousRegions}
            />
            {suspiciousRegions.length > 0 && (
              <div className="mt-3 space-y-1">
                {suspiciousRegions.map((region, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{region.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <button className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              REVIEW CASE
            </button>
            <button
              onClick={() => navigate('/screening/new')}
              className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
            >
              New Screening
            </button>
          </div>

          {/* AI Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>AI-assisted screening.</strong> Final decision remains with authorized personnel. This system provides assistive risk assessment and does not replace human verification.
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500 space-y-1">
            <p>Screened: {new Date(caseData.created_at).toLocaleString('en-IN')}</p>
            {caseData.completed_at && (
              <p>Completed: {new Date(caseData.completed_at).toLocaleString('en-IN')}</p>
            )}
            <p>Case ID: <span className="font-mono">{caseData.id}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
