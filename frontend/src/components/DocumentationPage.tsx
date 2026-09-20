import { ArrowLeft, BookOpen, BrainCircuit, ScanSearch, Workflow, Layers, Code, Lightbulb, GraduationCap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const GLOSSARY = [
  { 
    term: "NLP (Natural Language Processing)", 
    def: "A branch of AI that helps computers understand, interpret, and manipulate human language.",
    math: "P(W) = ∏ P(w_i | w_1...w_{i-1})",
    example: "Teaching a computer that 'Apple' in 'Apple stock' is a company, but in 'Apple pie' is a fruit."
  },
  { 
    term: "TF-IDF (Term Frequency-Inverse Document Frequency)", 
    def: "A statistical math equation that figures out how 'important' a word is in your resume.",
    math: "TF-IDF(t,d) = (f_t,d / Σ f_{w,d}) × log(N / df_t)",
    example: "If 'React' appears 3 times in your resume, its TF goes up. But if 'the' appears 50 times, IDF forces its score to near 0."
  },
  { 
    term: "Embeddings", 
    def: "Turning words into multi-dimensional vectors (arrays of numbers).",
    math: "f: X → ℝ^n",
    example: "Mapping 'Dog' to [0.2, 0.8, -0.1] and 'Puppy' to [0.3, 0.7, -0.2]. They are very close together on the graph."
  },
  { 
    term: "Sentence Transformers", 
    def: "A specific type of AI model that creates embeddings for entire sentences instead of just single words.",
    math: "BERT(CLS) + Pooling Layer → 384-d vector",
    example: "'Led a team of 5' and 'Managed 5 employees' will result in nearly identical mathematical vectors."
  },
  { 
    term: "Cosine Similarity", 
    def: "Measuring the angle between two embedding points to see how similar they are.",
    math: "cos(θ) = (A · B) / (||A|| ||B||)",
    example: "If the angle is 0° (cos=1), they mean the exact same thing. If the angle is 90° (cos=0), they are completely unrelated."
  },
  { 
    term: "N-grams", 
    def: "Chopping text into contiguous sequences of N items.",
    math: "S_n = (w_1...w_n), (w_2...w_{n+1})...",
    example: "From 'Senior Software Engineer': 1-gram = ['Senior', 'Software', 'Engineer']. 2-gram = ['Senior Software', 'Software Engineer']."
  }
];

const DOC_STEPS = [
  {
    title: "1. The Absolute Basics: ATS & NLP",
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
    description: "When you apply for a job, your resume usually goes into an Applicant Tracking System (ATS). Traditionally, these systems are just 'dumb' keyword scanners. If they don't see the exact word they want, they reject you. ResuMatch uses Natural Language Processing (NLP) to actually 'read' and understand your resume like a human recruiter would.",
    details: [
      { label: "What is an ATS?", value: "A software used by HR to filter thousands of resumes. Standard ones just use exact text matching." },
      { label: "What is NLP?", value: "A branch of AI that gives computers the ability to understand text in the same way human beings can." }
    ],
    code: `# A traditional ATS does something this simple (and flawed):
def is_match(resume_text, required_skill):
    # Returns True ONLY if the exact word matches
    return required_skill.lower() in resume_text.lower()

# If required="Frontend" and resume says "UI Developer" -> False!`
  },
  {
    title: "2. Lexical Baseline (TF-IDF)",
    icon: <ScanSearch className="w-8 h-8 text-primary" />,
    description: "Before diving into deep AI, ResuMatch checks for basic statistical keyword frequency. It establishes a baseline by measuring how often a required word appears in your resume compared to how often it appears generally.",
    details: [
      { label: "Term Frequency (TF)", value: "Counts exact occurrences. If you say 'Python' 5 times, it takes notice." },
      { label: "Inverse Doc Frequency (IDF)", value: "Filters out filler words. 'The' and 'And' get ignored, while 'React' gets boosted." }
    ],
    code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 1. Initialize the math engine and ignore English filler words
vectorizer = TfidfVectorizer(stop_words='english')

# 2. Transform the raw text into a matrix of numbers
tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])

# 3. Calculate how statistically similar they are (0.0 to 1.0)
statistical_similarity = cosine_similarity(
    tfidf_matrix[0:1], 
    tfidf_matrix[1:2]
)[0][0]`
  },
  {
    title: "3. Semantic Embeddings",
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    description: "This is where the real AI kicks in. If a job asks for a 'Frontend Engineer' but you wrote 'UI Developer', a dumb scanner fails you. ResuMatch uses AI models to convert sentences into mathematical coordinates on a 384-dimensional map. 'Frontend' and 'UI Developer' are placed right next to each other on this map.",
    details: [
      { label: "Contextual Understanding", value: "Words with similar meanings map to nearby coordinates. It understands concepts, not just letters." },
      { label: "Sentence-Level Encoding", value: "It reads the meaning of entire bullet points (e.g. 'Led a team' = 'Management experience')." }
    ],
    code: `from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import math

# Load a pre-trained neural network model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Convert English sentences into 384-dimensional mathematical arrays
jd_coordinates = model.encode([jd_text])
resume_coordinates = model.encode([resume_text])

# Measure the geometric angle between the two points
raw_similarity = cosine_similarity(jd_coordinates, resume_coordinates)[0][0]

# Non-Linear NLP Scaling:
# Because a short resume bullet compared to a massive 500-word JD 
# will mathematically suppress the cosine score, we apply a square root 
# transformation to map the vector distance to a human-perceived scale.
human_perceived_score = math.sqrt(raw_similarity) if raw_similarity > 0 else 0`
  },
  {
    title: "4. Dynamic Requirement Extraction",
    icon: <Workflow className="w-8 h-8 text-primary" />,
    description: "How do we know what the job actually requires? Instead of relying on a hardcoded, outdated dictionary of skills, ResuMatch dynamically chops the Job Description into 1-word, 2-word, and 3-word chunks (N-grams). It then uses AI to figure out which chunks are the most important requirements.",
    details: [
      { label: "CountVectorizer", value: "Generates all possible phrase chunks from the raw Job Description text." },
      { label: "Cosine Filtering", value: "Mathematically filters out useless phrases and keeps the core requirements." }
    ],
    code: `from sklearn.feature_extraction.text import CountVectorizer

# Extract up to 3-word phrases (e.g. "Software", "Software Engineer")
vectorizer = CountVectorizer(ngram_range=(1, 3), stop_words=custom_stops)
vectorizer.fit([jd_text])
all_phrases = vectorizer.get_feature_names_out()

# Convert all those phrases into coordinates on our AI map
phrase_coords = model.encode(all_phrases)

# Find the phrases that geometrically point in the same 
# direction as the overall Job Description
similarities = cosine_similarity(phrase_coords, jd_coordinates)

# Keep the top 12 most relevant skills
core_requirements = get_top_n(all_phrases, similarities, n=12)`
  },
  {
    title: "5. Dynamic Weight Normalization",
    icon: <Layers className="w-8 h-8 text-primary" />,
    description: "Older AI systems penalize you heavily if you are missing arbitrary sections (like a dedicated 'Certifications' section). Our scoring algorithm is completely fair: if you don't have a specific section, it dynamically re-distributes the grading weight to the sections you DO have. You are judged purely on the content you provide.",
    details: [
      { label: "Fair Grading", value: "Missing a 'Projects' section won't drag down your total score to zero." },
      { label: "Weighted Fusion", value: "We dynamically combine your lexical math and semantic math to give one final true score." }
    ],
    code: `# The default Enterprise ATS grading rubric
base_weights = {
    "Skill Match": 0.40, "Experience": 0.25, 
    "Semantic Match": 0.15, "Projects": 0.10, 
    "Education": 0.05, "Certifications": 0.05
}

# 1. Look at what sections the candidate actually provided
active_weights = {"Skill Match": 0.40, "Semantic Match": 0.15}
if "projects" in parsed_sections:
    active_weights["Projects"] = 0.10

# 2. Re-calculate the grading denominator (e.g., 0.70 instead of 1.00)
total = sum(active_weights.values())
fair_weights = {k: v / total for k, v in active_weights.items()}

# 3. Grade the candidate using only their active, fair weights
final_score = sum(score * fair_weights[k] for k, score in scores.items())`
  },
  {
    title: "6. System Generalization & Limitations",
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    description: "ResuMatch is designed to generalize across almost any standard resume format. It doesn't rely on strict PDF coordinates. Instead, it uses intelligent regex alias mapping (e.g., mapping 'Internships' or 'Positions of Responsibility' directly to 'Experience', and mapping 'Awards' to 'Certifications'). However, it is not a perfect human.",
    details: [
      { label: "Robust Generalization", value: "Works on raw text extraction. If you use standard or semi-standard headers, the engine will find and categorize your content." },
      { label: "Known Limitations", value: "If you use highly unconventional headers (e.g., 'Things I Did'), the parser may miss the section entirely. Furthermore, while the semantic AI is powerful, it can occasionally hallucinate relevance if the context is ambiguous." }
    ],
    code: `# How we robustly categorize your sections:
SECTION_ALIASES = {
    "experience": [
        "work experience", "employment", 
        "internships", "positions of responsibility"
    ],
    "certifications": [
        "awards", "achievements", "licenses"
    ]
}

# If your resume has an "Achievements" header, 
# we automatically grade it as a Certification.`
  }
];

export function DocumentationPage() {
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border-subtle bg-surface shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-text-main tracking-tight hover:opacity-80 transition-opacity">
            ResuMatch
          </Link>
          <Link to="/" className="flex items-center text-sm font-medium text-muted hover:text-text-main transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-16 px-6">
        
        {/* Title */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-main tracking-tight mb-6">
            How It Works
          </h1>
          <p className="text-xl text-muted leading-relaxed max-w-3xl mx-auto mb-8">
            A comprehensive breakdown of how we use AI and Natural Language Processing to read resumes like a human being.
          </p>

          {/* Beginner Glossary Toggle */}
          <button 
            onClick={() => setShowGlossary(!showGlossary)}
            className="inline-flex items-center px-6 py-3 bg-surface border border-border-subtle rounded-full text-text-main font-medium hover:border-primary/50 hover:shadow-sm transition-all duration-300"
          >
            <GraduationCap className="w-5 h-5 mr-3 text-primary" />
            View Beginner's Jargon Glossary
            <ChevronRight className={`w-4 h-4 ml-3 transition-transform duration-300 ${showGlossary ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Glossary Expandable Area */}
        <div className={`w-full max-w-7xl overflow-hidden transition-all duration-500 ${showGlossary ? 'max-h-[2000px] mb-16 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-surface p-8 rounded-3xl border border-border-subtle shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GLOSSARY.map((item, i) => (
              <div key={i} className="bg-background p-6 rounded-2xl border border-border-subtle flex flex-col h-full">
                <h3 className="font-bold text-text-main mb-3 text-lg">{item.term}</h3>
                <p className="text-sm text-muted leading-relaxed mb-4 flex-grow">{item.def}</p>
                <div className="mt-auto space-y-3 pt-4 border-t border-border-subtle/50">
                  <div className="bg-surface border border-border-subtle rounded-lg p-3">
                    <span className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Mathematical Representation</span>
                    <code className="text-xs font-mono text-muted">{item.math}</code>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <span className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Simple Example</span>
                    <span className="text-xs text-text-main leading-relaxed italic">"{item.example}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical Sections */}
        <div className="w-full max-w-7xl space-y-16">
          {DOC_STEPS.map((step, idx) => (
            <section 
              key={idx} 
              className={`bg-surface p-8 md:p-12 rounded-3xl border border-border-subtle shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[${idx * 100}ms]`}
            >
              <div className="flex flex-col xl:flex-row gap-16">
                
                {/* Left Side: Concept */}
                <div className="flex-1 xl:w-5/12 shrink-0">
                  <div className="flex items-center mb-6">
                    {step.icon}
                    <h2 className="text-3xl font-bold text-text-main tracking-tight ml-4">{step.title}</h2>
                  </div>
                  <p className="text-muted text-lg leading-relaxed mb-8">
                    {step.description}
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} className="bg-background p-6 rounded-2xl border border-border-subtle">
                        <h4 className="font-semibold text-text-main mb-2 text-lg">{detail.label}</h4>
                        <p className="text-muted leading-relaxed">{detail.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Code Snippet (Light Theme) */}
                <div className="flex-1 xl:w-7/12 flex flex-col justify-center min-w-0">
                  <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border-subtle w-full">
                    <div className="px-5 py-3 bg-background border-b border-border-subtle flex items-center">
                      <Code className="w-4 h-4 text-muted mr-2" />
                      <span className="text-xs font-bold font-mono text-muted uppercase tracking-wider">Python Logic</span>
                    </div>
                    <div className="p-6 md:p-8 overflow-auto custom-scrollbar bg-background/50">
                      <pre className="text-[13px] sm:text-sm font-mono leading-relaxed">
                        <code className="text-text-main">
                          {step.code.split('\n').map((line, lIdx) => {
                            if (line.startsWith('from') || line.startsWith('import')) {
                              return <div key={lIdx}><span className="text-primary font-bold">{line}</span></div>
                            } else if (line.startsWith('#')) {
                              return <div key={lIdx}><span className="text-muted italic">{line}</span></div>
                            } else if (line.includes('def ') || line.includes('return ')) {
                              const parts = line.split(/(def |return )/);
                              return (
                                <div key={lIdx}>
                                  {parts.map((p, i) => (p === 'def ' || p === 'return ' ? <span key={i} className="text-primary font-bold">{p}</span> : <span key={i}>{p}</span>))}
                                </div>
                              )
                            } else {
                              return <div key={lIdx}>{line}</div>
                            }
                          })}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          ))}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-muted text-sm border-t border-border-subtle bg-surface mt-12">
        <p>&copy; {new Date().getFullYear()} ResuMatch. All rights reserved.</p>
      </footer>
    </div>
  );
}
