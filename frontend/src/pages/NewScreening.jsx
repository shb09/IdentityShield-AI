import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiUpload } from '../api';
import { Upload, Camera, Scan, FileText, User, X, CheckCircle, Loader2, Shield, AlertCircle, Clock } from 'lucide-react';

const documentTypes = [
  { value: 'passport', label: 'Passport', icon: FileText },
  { value: 'national_id', label: 'National ID', icon: FileText },
  { value: 'visa', label: 'Visa', icon: FileText },
  { value: 'driving_license', label: 'Driving License', icon: FileText },
  { value: 'permit', label: 'Permit', icon: FileText },
];

const processingSteps = [
  { key: 'ocr', label: 'OCR Extraction', icon: FileText },
  { key: 'validation', label: 'Document Validation', icon: CheckCircle },
  { key: 'tampering', label: 'Tampering Analysis', icon: Shield },
  { key: 'face', label: 'Face Verification', icon: User },
  { key: 'risk', label: 'Risk Assessment', icon: AlertCircle },
];

export default function NewScreening() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const docInputRef = useRef(null);
  const visaInputRef = useRef(null);
  const faceInputRef = useRef(null);

  const [docType, setDocType] = useState('passport');
  const [docFile, setDocFile] = useState(null);
  const [visaFile, setVisaFile] = useState(null);
  const [faceFile, setFaceFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [visaPreview, setVisaPreview] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (setFile, setPreview, inputRef) => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const startScreening = async () => {
    if (!docFile) { setError('Please upload a document'); return; }
    setError('');
    setProcessing(true);
    setCompletedSteps([]);
    setCurrentStep(0);
    setElapsed(0);

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('document', docFile);
    if (visaFile) formData.append('visa', visaFile);
    if (faceFile) formData.append('face', faceFile);

    // Progress animation
    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      setElapsed(prev => prev + 1);
      if (stepIndex < processingSteps.length) {
        setCurrentStep(stepIndex);
        setCompletedSteps(prev => [...prev, processingSteps[stepIndex].key]);
        stepIndex++;
      }
    }, 800);

    try {
      const result = await apiUpload('/api/screen', formData);
      clearInterval(progressInterval);
      setCompletedSteps(processingSteps.map(s => s.key));
      setCurrentStep(processingSteps.length);
      setTimeout(() => navigate(`/screening/${result.screening_id}`), 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Screening failed. The server may be waking up from sleep — please try again in 30 seconds.');
      setProcessing(false);
      setCurrentStep(-1);
      setCompletedSteps([]);
      setElapsed(0);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>New Screening</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload identity documents for AI-assisted analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Doc Type */}
          <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Document Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {documentTypes.map(dt => {
                const Icon = dt.icon;
                return (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                    style={{
                      background: docType === dt.value ? 'var(--accent-gradient)' : 'var(--bg-input)',
                      color: docType === dt.value ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${docType === dt.value ? 'transparent' : 'var(--border-card)'}`,
                      boxShadow: docType === dt.value ? '0 4px 16px var(--accent-glow)' : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {dt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doc Upload */}
          <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Identity Document <span className="text-rose-400">*</span>
            </h3>
            <input ref={docInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setDocFile, setDocPreview)} className="hidden" />
            {docPreview ? (
              <div className="relative">
                <img src={docPreview} alt="Document" className="w-full h-48 object-contain rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }} />
                <button onClick={() => removeFile(setDocFile, setDocPreview, docInputRef)} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: 'var(--danger)', color: 'white' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] mt-2 ml-1" style={{ color: 'var(--text-muted)' }}>{docFile?.name}</p>
              </div>
            ) : (
              <button onClick={() => docInputRef.current?.click()} className="w-full h-48 rounded-xl flex flex-col items-center justify-center transition-all duration-200" style={{ border: '2px dashed var(--border-card)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Upload className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">Click to upload document</p>
                <p className="text-[11px] mt-0.5 opacity-50">JPEG, PNG, WebP (max 10MB)</p>
              </button>
            )}
          </div>

          {/* Visa */}
          <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Visa Document <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(Optional)</span>
            </h3>
            <input ref={visaInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setVisaFile, setVisaPreview)} className="hidden" />
            {visaPreview ? (
              <div className="relative">
                <img src={visaPreview} alt="Visa" className="w-full h-36 object-contain rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }} />
                <button onClick={() => removeFile(setVisaFile, setVisaPreview, visaInputRef)} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--danger)', color: 'white' }}>
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[11px] mt-2 ml-1" style={{ color: 'var(--text-muted)' }}>{visaFile?.name}</p>
              </div>
            ) : (
              <button onClick={() => visaInputRef.current?.click()} className="w-full h-28 rounded-xl flex flex-col items-center justify-center transition-all duration-200" style={{ border: '1px dashed var(--border-card)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                <Upload className="w-5 h-5 mb-1 opacity-30" />
                <p className="text-xs">Upload visa (optional)</p>
              </button>
            )}
          </div>

          {/* Face */}
          <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Presented Person's Face <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(For verification)</span>
            </h3>
            <input ref={faceInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setFaceFile, setFacePreview)} className="hidden" />
            {facePreview ? (
              <div className="relative inline-block">
                <img src={facePreview} alt="Face" className="w-36 h-36 object-cover rounded-xl" style={{ border: '2px solid var(--border-card)' }} />
                <button onClick={() => removeFile(setFaceFile, setFacePreview, faceInputRef)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--danger)', color: 'white' }}>
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[11px] mt-2 ml-1" style={{ color: 'var(--text-muted)' }}>{faceFile?.name}</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => faceInputRef.current?.click()} className="flex-1 h-28 rounded-xl flex flex-col items-center justify-center transition-all duration-200" style={{ border: '1px dashed var(--border-card)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                  <Upload className="w-5 h-5 mb-1 opacity-30" />
                  <p className="text-xs">Upload photo</p>
                </button>
                <button className="flex-1 h-28 rounded-xl flex flex-col items-center justify-center opacity-40 cursor-not-allowed" style={{ border: '1px dashed var(--border-card)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                  <Camera className="w-5 h-5 mb-1 opacity-30" />
                  <p className="text-xs">Camera</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Start Button */}
          <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
            <button
              onClick={startScreening}
              disabled={processing || !docFile}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Scan className="w-4 h-4" /> START SCREENING</>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="badge-danger rounded-xl p-4 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="glass-card p-5 animate-fade-in" style={{ background: 'var(--gradient-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Analysis Progress</h3>
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" />
                  {elapsed}s
                </div>
              </div>
              <div className="space-y-2">
                {processingSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(step.key);
                  const isCurrent = currentStep === i && !isCompleted;
                  return (
                    <div key={step.key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300"
                      style={{
                        background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : isCurrent ? 'var(--accent-glow)' : 'var(--bg-input)',
                        border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.15)' : isCurrent ? 'var(--border-active)' : 'transparent'}`,
                      }}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} /> :
                       isCurrent ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} /> :
                       <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--border-card)' }} />}
                      <Icon className="w-3.5 h-3.5" style={{ color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--text-muted)' }} />
                      <span className="text-xs font-medium" style={{ color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {step.label}
                      </span>
                      {isCompleted && <span className="ml-auto text-[10px] font-bold" style={{ color: 'var(--success)' }}>Done</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note */}
          <div className="glass-card px-4 py-3" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
            <p className="text-[11px] leading-relaxed" style={{ color: '#f59e0b' }}>
              <strong>Note:</strong> This is an AI-assisted screening tool. First request may take up to 30s while the server wakes up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
