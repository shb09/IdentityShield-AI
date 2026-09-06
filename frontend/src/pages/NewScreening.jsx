import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiUpload } from '../api';
import {
  Upload, Camera, Scan, FileText, User, X,
  CheckCircle, Loader2, Shield, AlertCircle
} from 'lucide-react';

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
    if (!docFile) {
      setError('Please upload a document');
      return;
    }

    setError('');
    setProcessing(true);
    setCompletedSteps([]);
    setCurrentStep(0);

    // Simulate processing steps for UX
    const stepDelay = 800;
    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, stepDelay));
      setCompletedSteps(prev => [...prev, processingSteps[i].key]);
    }

    // Actual API call
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">New Screening</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload identity documents for AI-assisted analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Document Type */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Document Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {documentTypes.map(dt => {
                const Icon = dt.icon;
                return (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      docType === dt.value
                        ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {dt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">
              Identity Document <span className="text-red-500">*</span>
            </h3>
            <input
              ref={docInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setDocFile, setDocPreview)}
              className="hidden"
            />
            {docPreview ? (
              <div className="relative">
                <img src={docPreview} alt="Document" className="w-full h-48 object-contain bg-slate-50 rounded-lg" />
                <button
                  onClick={() => removeFile(setDocFile, setDocPreview, docInputRef)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-slate-500 mt-2">{docFile?.name}</p>
              </div>
            ) : (
              <button
                onClick={() => docInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-navy-400 hover:text-navy-500 transition-colors"
              >
                <Upload className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Click to upload document</p>
                <p className="text-xs mt-1">JPEG, PNG, WebP (max 10MB)</p>
              </button>
            )}
          </div>

          {/* Visa Upload (Optional) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">
              Visa Document <span className="text-slate-400 text-sm font-normal">(Optional)</span>
            </h3>
            <input
              ref={visaInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setVisaFile, setVisaPreview)}
              className="hidden"
            />
            {visaPreview ? (
              <div className="relative">
                <img src={visaPreview} alt="Visa" className="w-full h-40 object-contain bg-slate-50 rounded-lg" />
                <button
                  onClick={() => removeFile(setVisaFile, setVisaPreview, visaInputRef)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-slate-500 mt-2">{visaFile?.name}</p>
              </div>
            ) : (
              <button
                onClick={() => visaInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 transition-colors"
              >
                <Upload className="w-6 h-6 mb-1" />
                <p className="text-sm">Upload visa (optional)</p>
              </button>
            )}
          </div>

          {/* Face Upload */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">
              Presented Person's Face <span className="text-slate-400 text-sm font-normal">(For face verification)</span>
            </h3>
            <input
              ref={faceInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setFaceFile, setFacePreview)}
              className="hidden"
            />
            {facePreview ? (
              <div className="relative inline-block">
                <img src={facePreview} alt="Face" className="w-40 h-40 object-cover rounded-lg" />
                <button
                  onClick={() => removeFile(setFaceFile, setFacePreview, faceInputRef)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs text-slate-500 mt-2">{faceFile?.name}</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => faceInputRef.current?.click()}
                  className="flex-1 h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 transition-colors"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <p className="text-sm">Upload photo</p>
                </button>
                <button
                  className="flex-1 h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 transition-colors"
                  title="Camera capture coming soon"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <p className="text-sm">Use camera</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action & Processing */}
        <div className="space-y-5">
          {/* Start Button */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <button
              onClick={startScreening}
              disabled={processing || !docFile}
              className="w-full py-3 bg-navy-900 hover:bg-navy-800 disabled:bg-slate-300 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  START SCREENING
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Processing Steps */}
          {processing && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Analysis Progress</h3>
              <div className="space-y-3">
                {processingSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(step.key);
                  const isCurrent = currentStep === i;
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isCompleted ? 'bg-emerald-50' : isCurrent ? 'bg-blue-50' : 'bg-slate-50'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                      <Icon className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      {isCompleted && (
                        <span className="ml-auto text-xs text-emerald-600 font-medium">Complete</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Note:</strong> This is an AI-assisted screening tool. All results should be verified by authorized personnel before any action is taken.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
