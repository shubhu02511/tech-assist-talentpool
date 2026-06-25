'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { 
  FileUp, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  FileText, 
  ShieldAlert, 
  Cpu, 
  Database 
} from 'lucide-react';

interface ProcessingFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'extracting' | 'scrubbing' | 'ai' | 'saving' | 'completed' | 'error';
  progress: number;
  errorMsg?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<ProcessingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.docx')
    );

    if (validFiles.length === 0) {
      alert('Please upload PDF or DOCX (Word) documents only.');
      return;
    }

    const newFiles = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0,
      rawFile: file, // keep a temporary reference for uploading
    }));

    setFiles((prev) => [...prev, ...newFiles as any]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const processResumes = async () => {
    if (files.length === 0 || isProcessing) return;
    setIsProcessing(true);

    // Process files one by one to show detailed individual progress
    for (let i = 0; i < files.length; i++) {
      const fileEntry = files[i] as any;
      if (fileEntry.status === 'completed') continue;

      // Update state to Extracting
      updateFileState(fileEntry.id, { status: 'extracting', progress: 15 });
      await sleep(600); // Small delay to show step to user

      // Update state to Scrubbing
      updateFileState(fileEntry.id, { status: 'scrubbing', progress: 40 });
      await sleep(600);

      // Update state to AI processing
      updateFileState(fileEntry.id, { status: 'ai', progress: 65 });

      try {
        const formData = new FormData();
        formData.append('files', fileEntry.rawFile);

        const response = await fetch('/api/process', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('API server returned an error.');
        }

        const data = await response.json();
        const result = data.results?.[0];

        if (result && result.status === 'success') {
          updateFileState(fileEntry.id, { status: 'saving', progress: 90 });
          await sleep(400);
          updateFileState(fileEntry.id, { status: 'completed', progress: 100 });
        } else {
          throw new Error(result?.error || 'Failed to parse resume.');
        }
      } catch (err: any) {
        console.error(err);
        updateFileState(fileEntry.id, { 
          status: 'error', 
          progress: 100, 
          errorMsg: err.message || 'Processing failed' 
        });
      }
    }

    setIsProcessing(false);
  };

  const updateFileState = (id: string, updates: Partial<ProcessingFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusLabel = (status: ProcessingFile['status']) => {
    switch (status) {
      case 'pending': return 'Ready to process';
      case 'extracting': return 'Extracting text locally...';
      case 'scrubbing': return 'Scrubbing PII contact details...';
      case 'ai': return 'AI extracting skills & history...';
      case 'saving': return 'Storing in database...';
      case 'completed': return 'Processed successfully';
      case 'error': return 'Failed';
      default: return '';
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const isAllFinished = files.length > 0 && (completedCount + errorCount === files.length);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
          Talent Pool Resume Uploader
        </h1>
        <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
          Upload PDF or Word resumes. Our system automatically extracts contact details, scrubs PII, and structures skills using Gemini AI.
        </p>
      </div>

      {/* Explanatory Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white">1. Local Scrubbing</h3>
          <p className="mt-2 text-sm text-slate-400">
            PII (email, phone, URLs) is extracted via local regex and replaced with secure placeholders.
          </p>
        </div>
        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white">2. AI Skill Extraction</h3>
          <p className="mt-2 text-sm text-slate-400">
            Scrubbed text is sent to Gemini AI to structure professional skills, experience, and history.
          </p>
        </div>
        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-white">3. Secure Database</h3>
          <p className="mt-2 text-sm text-slate-400">
            The database stores contact data separate from AI results for clean search and indexing.
          </p>
        </div>
      </div>

      {/* File Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer ${
          isDragging 
            ? 'border-indigo-400 bg-indigo-500/5' 
            : 'border-white/20 bg-slate-900 hover:border-white/30 hover:bg-slate-900/50'
        } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-300 border border-white/10 group-hover:scale-110 transition-transform duration-300 mb-4">
          <FileUp className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-white">
          Drag and drop resumes here, or <span className="text-indigo-400">browse</span>
        </p>
        <p className="mt-2 text-sm text-slate-400">PDF or Word DOCX files (up to 10MB)</p>
      </div>

      {/* Files List & Progress */}
      {files.length > 0 && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <h2 className="text-lg font-bold text-white">Resumes Queue ({files.length})</h2>
            {!isProcessing && (
              <button
                onClick={clearFiles}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="relative flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-md">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                    </div>
                  </div>

                  {/* Actions / Status Icon */}
                  <div className="flex items-center">
                    {file.status === 'pending' && !isProcessing && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    )}
                    {['extracting', 'scrubbing', 'ai', 'saving'].includes(file.status) && (
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                    )}
                    {file.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center gap-2 text-rose-400">
                        <span className="text-xs truncate max-w-xs">{file.errorMsg}</span>
                        <XCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar and label */}
                {file.status !== 'pending' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{getStatusLabel(file.status)}</span>
                      <span>{file.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ease-out ${
                          file.status === 'error' 
                            ? 'bg-rose-500' 
                            : file.status === 'completed' 
                              ? 'bg-emerald-500' 
                              : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="text-sm text-slate-400">
              {isProcessing && (
                <span>Processing in progress... please do not close this window.</span>
              )}
              {isAllFinished && (
                <span className="text-emerald-400 font-medium">
                  Done! {completedCount} successfully processed, {errorCount} errors.
                </span>
              )}
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              {!isAllFinished ? (
                <button
                  onClick={processResumes}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-95 transition-all text-sm font-semibold text-white px-6 py-3 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Parsing Resumes...
                    </>
                  ) : (
                    'Parse Resumes'
                  )}
                </button>
              ) : (
                <Link
                  href="/search"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-sm font-semibold text-white px-6 py-3 shadow-lg shadow-emerald-500/20"
                >
                  Go to Talent Pool Search
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
