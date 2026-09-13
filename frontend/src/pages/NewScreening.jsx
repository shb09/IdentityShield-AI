import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiUpload } from '../api';
import { Upload, Camera, Scan, FileText, User, X, CheckCircle, Loader2, Shield, AlertCircle } from 'lucide-react';

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

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('document', docFile);
    if (visaFile) formData.append('visa', visaFile);
    if (faceFile) formData.append('face', faceFile);

    // Run progress animation concurrently with API call
    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < processingSteps.length) {
        setCurrentStep(stepIndex);
        setCompletedSteps(prev => [...prev, processingSteps[stepIndex].key]);
        stepIndex++;
      }
    }, 600);

    try {
      const result = await apiUpload('/api/screen', formData);
      clearInterval(progressInterval);
      // Ensure all steps show completed
      setCompletedSteps(processingSteps.map(s => s.key));
      setCurrentStep(processingSteps.length);
      setTimeout(() => navigate(`/screening/${result.screening_id}`), 400);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Screening failed. Please try again.');
      setProcessing(false);
      setCurrentStep(-1);
      setCompletedSteps([]);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>New Screening</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Upload identity documents for AI-assisted analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Doc Type */}
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Document Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {documentTypes.map(dt => {
                const Icon = dt.icon;
                return (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all"
                    style={{
                      background: docType === dt.value ? 'var(--accent)' : 'var(--bg-input)',
                      color: docType === dt.value ? 'white' : 'var(--text-secondary)',
                      borderColor: docType === dt.value ? 'var(--accent)' : 'var(--border-color)',
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
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Identity Document <span className="text-rose-400">*</span>
            </h3>
            <input ref={docInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setDocFile, setDocPreview)} className="hidden" />
            {docPreview ? (
              <div className="relative">
                <img src={docPreview} alt="Document" className="w-full h-44 object-contain rounded-xl" style={{ background: 'var(--bg-input)' }} />
                <button onClick={() => removeFile(setDocFile, setDocPreview, docInputRef)} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-sm">
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] mt-2 ml-1" style={{ color: 'var(--text-muted)' }}>{docFile?.name}</p>
              </div>
            ) : (
              <button onClick={() => docInputRef.current?.click()} className="w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                <Upload className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">Click to upload document</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>JPEG, PNG, WebP (max 10MB)</p>
              </button>
            )}
          </div>

          {/* Visa */}
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Visa Document <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(Optional)</span>
            </h3>
            <input ref={visaInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setVisaFile, setVisaPreview)} className="hidden" />
            {visaPreview ? (
              <div className="relative">
                <img src={visaPreview} alt="Visa" className="w-full h-36 object-contain rounded-xl" style={{ background: 'var(--bg-input)' }} />
                <button onClick={() => removeFile(setVisaFile, setVisaPreview, visaInputRef)} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] mt-2 ml-1" style={{ color: 'var(--text-muted)' }}>{visaFile?.name}</p>
              </div>
            ) : (
              <button onClick={() => visaInputRef.current?.click()} className="w-full h-28 border border-dashed rounded-xl flex flex-col items-center justify-center transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                <Upload className="w-5 h-5 mb-1 opacity-30" />
                <p className="text-xs">Upload visa (optional)</p>
              </button>
            )}
          </div>

          {/* Face */}
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Presented Person's Face <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(For verification)</span>
            </h3>
            <input ref={faceInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setFaceFile, setFacePreview)} className="hidden" />
            {facePreview ? (
              <div className="relative inline-block">
                <img src={facePreview} alt="Face" className="w-36 h-36 object-cover rounded-xl" />
                <button onClick={() => removeFile(setFaceFile, setFacePreview, faceInputRef)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600">
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[11px] mt-2 ml-1" style={{ color: 'var(--text-muted)' }}>{faceFile?.name}</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => faceInputRef.current?.click()} className="flex-1 h-28 border border-dashed rounded-xl flex flex-col items-center justify-center transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                  <Upload className="w-5 h-5 mb-1 opacity-30" />
                  <p className="text-xs">Upload photo</p>
                </button>
                <button className="flex-1 h-28 border border-dashed rounded-xl flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-input)', opacity: 0.5 }}>
                  <Camera className="w-5 h-5 mb-1 opacity-30" />
                  <p className="text-xs">Camera</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <button
              onClick={startScreening}
              disabled={processing || !docFile}
              className="w-full py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/25 disabled:shadow-none disabled:opacity-50"
              style={{ background: processing ? 'var(--text-muted)' : 'var(--accent)' }}
            >
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Scan className="w-4 h-4" /> START SCREENING</>
              )}
            </button>
          </div>

          {error && (
            <div className="rounded-2xl p-4 flex items-start gap-2 border" style={{ background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          )}

          {processing && (
            <div className="rounded-2xl border shadow-sm p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Analysis Progress</h3>
              <div className="space-y-2">
                {processingSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(step.key);
                  const isCurrent = currentStep === i && !isCompleted;
                  return (
                    <div key={step.key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
                      style={{
                        background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : isCurrent ? 'var(--accent-bg)' : 'var(--bg-input)',
                      }}>
                      {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                       isCurrent ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} /> :
                       <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--border-color)' }} />}
                      <Icon className="w-3.5 h-3.5" style={{ color: isCompleted ? '#10b981' : isCurrent ? 'var(--accent)' : 'var(--text-muted)' }} />
                      <span className="text-xs font-medium" style={{ color: isCompleted ? '#10b981' : isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {step.label}
                      </span>
                      {isCompleted && <span className="ml-auto text-[10px] text-emerald-500 font-semibold">Done</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-4 border" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.15)' }}>
            <p className="text-[11px] leading-relaxed" style={{ color: '#f59e0b' }}>
              <strong>Note:</strong> This is an AI-assisted screening tool. All results should be verified by authorized personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
