import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiUpload } from '../api';
import { Upload, Camera, Scan, FileText, User, X, CheckCircle, Loader2, Shield, AlertCircle, Clock } from 'lucide-react';

const docTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'visa', label: 'Visa' },
  { value: 'driving_license', label: 'License' },
  { value: 'permit', label: 'Permit' },
];

const steps = [
  { key: 'ocr', label: 'OCR', icon: FileText },
  { key: 'validation', label: 'Validation', icon: CheckCircle },
  { key: 'tampering', label: 'Tampering', icon: Shield },
  { key: 'face', label: 'Face', icon: User },
  { key: 'risk', label: 'Risk', icon: AlertCircle },
];

export default function NewScreening() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const docRef = useRef(null);
  const faceRef = useRef(null);

  const [docType, setDocType] = useState('passport');
  const [docFile, setDocFile] = useState(null);
  const [faceFile, setFaceFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState([]);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const handleFile = (e, setFile, setPreview) => {
    const f = e.target.files[0];
    if (f) { setFile(f); const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f); }
  };

  const remove = (setFile, setPreview, ref) => { setFile(null); setPreview(null); if (ref.current) ref.current.value = ''; };

  const startScreening = async () => {
    if (!docFile) { setError('Upload a document'); return; }
    setError('');
    setProcessing(true);
    setDoneSteps([]);
    setCurrentStep(0);
    setElapsed(0);

    const fd = new FormData();
    fd.append('document_type', docType);
    fd.append('document', docFile);
    if (faceFile) fd.append('face', faceFile);

    const timer = setInterval(() => setElapsed(p => p + 1), 1000);
    let si = 0;
    const prog = setInterval(() => {
      if (si < steps.length) { setCurrentStep(si); setDoneSteps(p => [...p, steps[si].key]); si++; }
    }, 2000);

    try {
      const result = await apiUpload('/api/screen', fd);
      clearInterval(prog); clearInterval(timer);
      setDoneSteps(steps.map(s => s.key));
      setCurrentStep(steps.length);
      await new Promise(r => setTimeout(r, 500));
      navigate(`/screening/${result.screening_id}`, { replace: true });
    } catch (err) {
      clearInterval(prog); clearInterval(timer);
      const msg = err.message || 'Failed';
      setError(msg.includes('fetch') ? 'Server waking up — wait 30s' : msg);
      setProcessing(false); setCurrentStep(-1); setDoneSteps([]); setElapsed(0);
    }
  };

  return (
    <div className="space-y-5 anim-fade-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>New Screening</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Upload identity documents for AI analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {/* Doc type */}
          <div className="card p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Document Type</h3>
            <div className="flex flex-wrap gap-1.5">
              {docTypes.map(dt => (
                <button key={dt.value} onClick={() => setDocType(dt.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all inter"
                  style={{
                    background: docType === dt.value ? 'var(--gradient-1)' : 'var(--bg-input)',
                    color: docType === dt.value ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${docType === dt.value ? 'transparent' : 'var(--border)'}`,
                    boxShadow: docType === dt.value ? '0 2px 8px var(--accent-glow)' : 'none',
                  }}>
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Doc upload */}
          <div className="card p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Document <span style={{ color: 'var(--danger)' }}>*</span>
            </h3>
            <input ref={docRef} type="file" accept="image/*" onChange={e => handleFile(e, setDocFile, setDocPreview)} className="hidden" />
            {docPreview ? (
              <div className="relative">
                <img src={docPreview} alt="" className="w-full h-44 object-contain rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }} />
                <button onClick={() => remove(setDocFile, setDocPreview, docRef)} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--danger)', color: 'white' }}>
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[10px] mt-1.5 ml-1 font-mono" style={{ color: 'var(--text-muted)' }}>{docFile?.name}</p>
              </div>
            ) : (
              <button onClick={() => docRef.current?.click()} className="w-full h-44 rounded-xl flex flex-col items-center justify-center transition-all inter"
                style={{ border: '2px dashed var(--border)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <Upload className="w-7 h-7 mb-2 opacity-30" />
                <p className="text-xs font-medium">Click to upload</p>
                <p className="text-[10px] mt-0.5 opacity-50">JPEG, PNG, WebP (max 10MB)</p>
              </button>
            )}
          </div>

          {/* Face upload */}
          <div className="card p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Presented Face <span className="normal-case font-normal">(optional)</span>
            </h3>
            <input ref={faceRef} type="file" accept="image/*" onChange={e => handleFile(e, setFaceFile, setFacePreview)} className="hidden" />
            {facePreview ? (
              <div className="relative inline-block">
                <img src={facePreview} alt="" className="w-28 h-28 object-cover rounded-xl" style={{ border: '2px solid var(--border)' }} />
                <button onClick={() => remove(setFaceFile, setFacePreview, faceRef)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--danger)', color: 'white' }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button onClick={() => faceRef.current?.click()} className="w-full h-24 rounded-xl flex flex-col items-center justify-center transition-all inter"
                style={{ border: '1px dashed var(--border)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                <Upload className="w-5 h-5 mb-1 opacity-30" />
                <p className="text-[11px]">Upload face photo</p>
              </button>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-3">
          <div className="card p-4">
            <button onClick={startScreening} disabled={processing || !docFile}
              className="btn btn-accent w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none inter">
              {processing ? <><Loader2 className="w-4 h-4 anim-spin" /> Analyzing...</> : <><Scan className="w-4 h-4" /> Start Screening</>}
            </button>
          </div>

          {error && (
            <div className="badge-danger rounded-xl p-3 text-xs flex items-start gap-2 anim-fade-up">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {processing && (
            <div className="card p-4 anim-fade-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Progress</h3>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" /> {elapsed}s
                </div>
              </div>
              <div className="space-y-1.5">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const done = doneSteps.includes(step.key);
                  const active = currentStep === i && !done;
                  return (
                    <div key={step.key} className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all"
                      style={{ background: done ? 'rgba(16,185,129,0.06)' : active ? 'var(--accent-glow)' : 'transparent' }}>
                      {done ? <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} /> :
                       active ? <Loader2 className="w-3.5 h-3.5 anim-spin" style={{ color: 'var(--accent)' }} /> :
                       <div className="w-3.5 h-3.5 rounded-full border-[1.5px]" style={{ borderColor: 'var(--border)' }} />}
                      <Icon className="w-3 h-3" style={{ color: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--text-muted)' }} />
                      <span className="text-[11px] font-medium" style={{ color: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {step.label}
                      </span>
                      {done && <span className="ml-auto text-[9px] font-bold" style={{ color: 'var(--success)' }}>OK</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-xl p-3 text-[10px]" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
            First request may take ~30s (server cold start).
          </div>
        </div>
      </div>
    </div>
  );
}
