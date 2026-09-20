import { ArrowLeft, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface ResultsViewProps {
  results: any;
  onReset: () => void;
}

export function ResultsView({ results, onReset }: ResultsViewProps) {
  const { overall_score, breakdown, matched_skills, missing_skills, recommendations, section_matches } = results;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-surface border-border-subtle';
    if (score >= 60) return 'bg-surface border-border-subtle';
    return 'bg-surface border-border-subtle';
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onReset} className="flex items-center text-muted hover:text-primary mb-8 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Analysis
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Score & Breakdown */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div className={clsx("p-8 rounded-2xl border text-center flex flex-col items-center justify-center shadow-sm", getScoreBg(overall_score))}>
            <h3 className="text-xl font-semibold text-text-main mb-2">Compatibility Score</h3>
            <div className={clsx("text-7xl font-light my-4 tracking-tight", getScoreColor(overall_score))}>
              {overall_score}<span className="text-3xl text-muted font-light tracking-normal">/100</span>
            </div>
            <p className="text-xs text-muted max-w-[200px] leading-relaxed">Calculated using transformer-based semantic embeddings to measure contextual alignment.</p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
            <h3 className="text-lg font-semibold text-text-main mb-4 border-b border-border-subtle pb-3">Score Breakdown</h3>
            <div className="space-y-5">
              {Object.entries(breakdown).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm font-medium text-text-main mb-2">
                    <span>{key}</span>
                    {value !== null ? (
                      <span className={getScoreColor(value)}>{value}%</span>
                    ) : (
                      <span className="text-muted italic text-xs">N/A (Section Missing)</span>
                    )}
                  </div>
                  <div className="w-full bg-border-subtle rounded-full h-1.5">
                    {value !== null && (
                      <div className={clsx("h-1.5 rounded-full", value >= 80 ? 'bg-primary' : value >= 60 ? 'bg-muted' : 'bg-danger')} style={{ width: `${value}%` }}></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details & NLP Match */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
          
          {/* Recommendations */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
            <h3 className="text-lg font-semibold text-text-main mb-4 border-b border-border-subtle pb-3">Improvement Recommendations</h3>
            <ul className="space-y-4">
              {recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start">
                  <ChevronRight className="w-5 h-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
              <h3 className="text-lg font-semibold text-text-main mb-4 border-b border-border-subtle pb-3 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                Matched Requirements
              </h3>
              <div className="flex flex-wrap gap-2">
                {matched_skills.length > 0 ? matched_skills.map((s: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-background border border-border-subtle text-text-main rounded-md text-sm font-medium">
                    {typeof s === 'string' ? s : s.skill}
                  </span>
                )) : <span className="text-muted text-sm italic">No skills matched.</span>}
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
              <h3 className="text-lg font-semibold text-text-main mb-4 border-b border-border-subtle pb-3 flex items-center">
                <XCircle className="w-4 h-4 mr-2 text-muted" />
                Missing Requirements
              </h3>
              <div className="flex flex-wrap gap-2">
                {missing_skills.length > 0 ? missing_skills.map((s: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-background border border-border-subtle text-muted rounded-md text-sm font-medium line-through decoration-danger/50">
                    {typeof s === 'string' ? s : s.skill}
                  </span>
                )) : <span className="text-muted text-sm italic">No skills missing!</span>}
              </div>
            </div>
          </div>

          {/* Detailed Contextual Breakdown */}
          {matched_skills.length > 0 && typeof matched_skills[0] !== 'string' && (
            <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
              <h3 className="text-lg font-semibold text-text-main mb-1">Detailed Requirement Evidence</h3>
              <p className="text-muted text-sm mb-6 border-b border-border-subtle pb-3">Hover over matches to see the exact context from your resume.</p>
              <div className="space-y-4">
                {matched_skills.map((s: any, i: number) => (
                  <div key={i} className="group relative bg-background p-5 rounded-xl border border-border-subtle hover:border-primary transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-text-main">{s.skill}</span>
                      <span className="text-xs bg-primary text-surface px-2.5 py-1 rounded-full font-mono font-medium tracking-wide">
                        {Math.round(s.similarity * 100)}% Match
                      </span>
                    </div>
                    <div className="text-sm text-muted leading-relaxed font-serif italic border-l-2 border-primary/20 pl-4">
                      "...{s.resume_evidence}..."
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced NLP Analysis */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
            <h3 className="text-lg font-semibold text-text-main mb-1">Advanced NLP Analysis</h3>
            <p className="text-muted text-sm mb-6 border-b border-border-subtle pb-3">Comparing pure keyword overlap (TF-IDF) vs contextual meaning (Embeddings).</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted border-b border-border-subtle">
                    <th className="pb-4 font-medium uppercase tracking-wider text-xs">Resume Section</th>
                    <th className="pb-4 font-medium uppercase tracking-wider text-xs">TF-IDF (Lexical)</th>
                    <th className="pb-4 font-medium uppercase tracking-wider text-xs">Embedding (Semantic)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(section_matches).map(([section, scores]: [string, any]) => (
                    <tr key={section} className="border-b border-border-subtle/30 last:border-0 hover:bg-background/50 transition-colors">
                      <td className="py-4 font-medium text-text-main capitalize">{section}</td>
                      <td className="py-4">
                        <span className="text-muted font-mono bg-background border border-border-subtle px-2 py-1 rounded">
                          {scores.tfidf_score}%
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-primary font-mono bg-background border border-primary/20 px-2 py-1 rounded font-medium">
                          {scores.semantic_score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
