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

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 700));
      setCompletedSteps(prev => [...prev, processingSteps[i].key]);
    }

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('document', docFile);
    if (visaFile) formData.append('visa', visaFile);
    if (faceFile) formData.append('face', faceFile);

    try {
      const result = await apiUpload('/api/screen', formData);
      navigate(`/screening/${result.screening_id}`);
    } catch (err) {
      setError(err.message || 'Screening failed. Please try again.');
      setProcessing(false);
      setCurrentStep(-1);
      setCompletedSteps([]);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">New Screening</h1>
        <p className="text-sm text-slate-400 mt-0.5">Upload identity documents for AI-assisted analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Doc Type */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Document Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {documentTypes.map(dt => {
                const Icon = dt.icon;
                return (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      docType === dt.value
                        ? 'bg-[#6366f1] text-white border-[#6366f1] shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {dt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doc Upload */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Identity Document <span className="text-rose-400">*</span>
            </h3>
            <input ref={docInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setDocFile, setDocPreview)} className="hidden" />
            {docPreview ? (
              <div className="relative">
                <img src={docPreview} alt="Document" className="w-full h-44 object-contain bg-slate-50 rounded-xl" />
                <button onClick={() => removeFile(setDocFile, setDocPreview, docInputRef)} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-sm">
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] text-slate-400 mt-2 ml-1">{docFile?.name}</p>
              </div>
            ) : (
              <button onClick={() => docInputRef.current?.click()} className="w-full h-44 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-[#6366f1] transition-colors bg-slate-50/50">
                <Upload className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">Click to upload document</p>
                <p className="text-[11px] text-slate-300 mt-0.5">JPEG, PNG, WebP (max 10MB)</p>
              </button>
            )}
          </div>

          {/* Visa */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Visa Document <span className="text-slate-300 text-xs font-normal">(Optional)</span>
            </h3>
            <input ref={visaInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setVisaFile, setVisaPreview)} className="hidden" />
            {visaPreview ? (
              <div className="relative">
                <img src={visaPreview} alt="Visa" className="w-full h-36 object-contain bg-slate-50 rounded-xl" />
                <button onClick={() => removeFile(setVisaFile, setVisaPreview, visaInputRef)} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] text-slate-400 mt-2 ml-1">{visaFile?.name}</p>
              </div>
            ) : (
              <button onClick={() => visaInputRef.current?.click()} className="w-full h-28 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 transition-colors bg-slate-50/50">
                <Upload className="w-5 h-5 mb-1 opacity-30" />
                <p className="text-xs">Upload visa (optional)</p>
              </button>
            )}
          </div>

          {/* Face */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Presented Person's Face <span className="text-slate-300 text-xs font-normal">(For verification)</span>
            </h3>
            <input ref={faceInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, setFaceFile, setFacePreview)} className="hidden" />
            {facePreview ? (
              <div className="relative inline-block">
                <img src={facePreview} alt="Face" className="w-36 h-36 object-cover rounded-xl" />
                <button onClick={() => removeFile(setFaceFile, setFacePreview, faceInputRef)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600">
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[11px] text-slate-400 mt-2 ml-1">{faceFile?.name}</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => faceInputRef.current?.click()} className="flex-1 h-28 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 transition-colors bg-slate-50/50">
                  <Upload className="w-5 h-5 mb-1 opacity-30" />
                  <p className="text-xs">Upload photo</p>
                </button>
                <button className="flex-1 h-28 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 bg-slate-50/50" title="Coming soon">
                  <Camera className="w-5 h-5 mb-1 opacity-30" />
                  <p className="text-xs">Camera</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <button
              onClick={startScreening}
              disabled={processing || !docFile}
              className="w-full py-3 bg-[#6366f1] hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-indigo-500/20 disabled:shadow-none"
            >
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Scan className="w-4 h-4" /> START SCREENING</>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          )}

          {processing && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Analysis Progress</h3>
              <div className="space-y-2">
                {processingSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(step.key);
                  const isCurrent = currentStep === i;
                  return (
                    <div key={step.key} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                      isCompleted ? 'bg-emerald-50' : isCurrent ? 'bg-indigo-50' : 'bg-slate-50'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                       isCurrent ? <Loader2 className="w-4 h-4 text-[#6366f1] animate-spin" /> :
                       <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                      <Icon className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-500' : isCurrent ? 'text-[#6366f1]' : 'text-slate-300'}`} />
                      <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      {isCompleted && <span className="ml-auto text-[10px] text-emerald-500 font-semibold">Done</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4">
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <strong>Note:</strong> This is an AI-assisted screening tool. All results should be verified by authorized personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
