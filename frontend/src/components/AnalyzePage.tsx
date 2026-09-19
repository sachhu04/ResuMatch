import { useState } from 'react';
import { Upload, FileText, XCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { ResultsView } from './ResultsView';

const LOADING_STEPS = [
  "Parsing Document Structure...",
  "Dynamically Extracting JD Requirements...",
  "Generating Semantic Embeddings...",
  "Computing Cosine Similarity...",
  "Finalizing Compatibility Score..."
];

export function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jdTitle, setJdTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Animation state
  const [loadingStep, setLoadingStep] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jdTitle || !jdText) {
      setErrorMsg("Please provide a resume file, job title, and job description text.");
      return;
    }

    setStatus('uploading');
    setErrorMsg('');
    setLoadingStep(0);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jd_title', jdTitle);
    formData.append('jd_text', jdText);

    setStatus('analyzing');

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const data = JSON.parse(line);
            if (data.error) {
              setStatus('error');
              setErrorMsg(data.error);
              return;
            }
            if (data.step) {
              setLoadingStep(data.step);
            }
            if (data.results) {
              setResults(data.results);
              setStatus('complete');
            }
          } catch (e) {
            console.error("Failed to parse chunk:", line);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "An error occurred during analysis.");
    }
  };

  if (status === 'complete' && results) {
    return <ResultsView results={results} onReset={() => setStatus('idle')} />;
  }

  if (status === 'analyzing') {
    return (
      <div className="max-w-3xl mx-auto py-24 px-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-surface p-12 rounded-2xl border border-border-subtle shadow-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-8">Processing Resume</h2>
          <div className="space-y-6">
            {LOADING_STEPS.map((step, index) => {
              // Now loadingStep from API is 1-indexed (1 to 6)
              // index is 0 to 4
              const stepNumber = index + 1;
              const isPast = stepNumber < loadingStep;
              const isCurrent = stepNumber === loadingStep;
              const isFuture = stepNumber > loadingStep;
              
              return (
                <div key={index} className={`flex items-center transition-all duration-500 ${isFuture ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-8 flex justify-center mr-4">
                    {isPast ? (
                      <CheckCircle2 className="text-primary w-6 h-6 animate-in zoom-in" />
                    ) : isCurrent ? (
                      <Loader2 className="text-muted w-6 h-6 animate-spin" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-border-subtle" />
                    )}
                  </div>
                  <span className={`text-lg ${isPast ? 'text-primary font-medium' : isCurrent ? 'text-text-main font-medium animate-pulse' : 'text-muted'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-bold text-text-main mb-8">Analyze Resume Match</h2>
      
      {errorMsg && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Resume Upload */}
        <div className="bg-surface p-8 rounded-xl border border-border-subtle shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-primary" />
            1. Upload Resume
          </h3>
          <p className="text-muted mb-6">Upload your resume in PDF or DOCX format. Our NLP engine will extract your skills, experience, and education.</p>
          
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl p-8 hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input type="file" accept=".pdf,.docx,.doc" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <FileText className="w-12 h-12 text-muted mb-4" />
            <p className="font-medium text-text-main mb-1">
              {file ? file.name : 'Drag & drop or click to upload'}
            </p>
            <p className="text-sm text-muted">Supports PDF, DOCX</p>
          </div>
        </div>

        {/* Right Column: Job Description */}
        <div className="bg-surface p-8 rounded-xl border border-border-subtle shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            2. Job Details
          </h3>
          <p className="text-muted mb-6">Paste the job description. The system will semantically compare requirements against your resume.</p>
          
          <div className="flex flex-col space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Job Title</label>
              <input 
                type="text" 
                value={jdTitle}
                onChange={e => setJdTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-text-main mb-1">Job Description</label>
              <textarea 
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full flex-1 p-4 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none min-h-[200px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleAnalyze}
          disabled={status === 'uploading'}
          className="flex items-center px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-secondary transition-all disabled:opacity-70 shadow-md"
        >
          Generate Compatibility Score
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
