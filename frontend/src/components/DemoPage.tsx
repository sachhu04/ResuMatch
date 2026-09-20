import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, PlayCircle } from 'lucide-react';
import { ResultsView } from './ResultsView';

const LOADING_STEPS = [
  "Parsing Document Structure...",
  "Dynamically Extracting JD Requirements...",
  "Generating Semantic Embeddings...",
  "Computing Cosine Similarity...",
  "Finalizing Compatibility Score..."
];

const MOCK_RESULTS = {
  overall_score: 70.78,
  breakdown: {
    "Skill Match": 90.00,
    "Semantic Match": 58.82,
    "Experience": 54.68,
    "Projects": 53.82,
    "Education": 67.33,
    "Certifications": null
  },
  matched_skills: [
    { skill: "Software Engineering", similarity: 0.60, resume_evidence: "Software Development Internship" },
    { skill: "Software Development", similarity: 0.63, resume_evidence: "Software Development Internship" },
    { skill: "Tech Cse Ece", similarity: 0.73, resume_evidence: "Tech in CSE (Specialization in AI and Data Science)" },
    { skill: "Software Engineering Software", similarity: 0.57, resume_evidence: "Software Development Internship" },
    { skill: "Software Development Design", similarity: 0.55, resume_evidence: "Software Development Internship" },
    { skill: "Software Cloud", similarity: 0.48, resume_evidence: "Architected scalable backend infrastructure leveraging Google Cloud Tasks, APIs, and Cloud Functions" },
    { skill: "Software Cloud Ai", similarity: 0.48, resume_evidence: "removal to generate AI" },
    { skill: "Location Tech Cse", similarity: 0.61, resume_evidence: "Tech in CSE (Specialization in AI and Data Science)" }
  ],
  missing_skills: ["Software Automation Qa", "Engineering Software Automation"],
  recommendations: [
    "The JD emphasizes skills you seem to be missing: Software Automation Qa, Engineering Software Automation. If you have these skills, ensure they are explicitly mentioned.",
    "You have the right skills, but the context in which they are used doesn't strongly align with the JD. Add more detail to your projects and experience."
  ],
  section_matches: {
    "contact_info": { "tfidf_score": 0, "semantic_score": 46.42 },
    "education": { "tfidf_score": 8.09, "semantic_score": 67.33 },
    "experience": { "tfidf_score": 3.94, "semantic_score": 54.68 },
    "projects": { "tfidf_score": 0.51, "semantic_score": 53.82 },
    "skills": { "tfidf_score": 1.77, "semantic_score": 54.71 },
    "overall": { "tfidf_score": 5.36, "semantic_score": 58.82 }
  }
};

export function DemoPage() {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [loadingStep, setLoadingStep] = useState(0);

  const runDemo = () => {
    setStatus('analyzing');
    setLoadingStep(1);
  };

  useEffect(() => {
    if (status === 'analyzing') {
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev >= 6) {
            clearInterval(interval);
            setStatus('complete');
            return prev;
          }
          return prev + 1;
        });
      }, 800); // Simulate processing time for each step

      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'complete') {
    return <ResultsView results={MOCK_RESULTS} onReset={() => setStatus('idle')} />;
  }

  if (status === 'analyzing') {
    return (
      <div className="max-w-3xl mx-auto py-24 px-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-surface p-12 rounded-2xl border border-border-subtle shadow-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-8">Running Interactive Demo</h2>
          <div className="space-y-6">
            {LOADING_STEPS.map((step, index) => {
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
    <div className="max-w-4xl mx-auto py-16 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-surface p-12 rounded-3xl border border-border-subtle shadow-lg">
        <h2 className="text-4xl font-extrabold text-text-main mb-6">Interactive Demo</h2>
        <p className="text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Experience the ResuMatch NLP engine in action. This demo uses a pre-loaded sample resume and Software Engineering job description to generate a live compatibility report without needing to upload any files.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          <div className="bg-background p-6 rounded-2xl border border-border-subtle">
            <h4 className="font-bold text-primary mb-2">Pre-loaded Resume</h4>
            <p className="text-sm text-muted">A standard student resume containing internships in backend development, GCP, and AI projects.</p>
          </div>
          <div className="bg-background p-6 rounded-2xl border border-border-subtle">
            <h4 className="font-bold text-primary mb-2">Target Job Description</h4>
            <p className="text-sm text-muted">Software Engineer focused on cloud architecture and test automation.</p>
          </div>
        </div>

        <button 
          onClick={runDemo}
          className="inline-flex items-center px-10 py-5 bg-primary text-white rounded-xl font-bold text-xl hover:bg-secondary hover:scale-105 transition-all shadow-xl shadow-primary/25"
        >
          <PlayCircle className="w-6 h-6 mr-3" />
          Run Demo Analysis
        </button>
      </div>
    </div>
  );
}
