import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Trash2, Home } from 'lucide-react';
import clsx from 'clsx';

interface AnalysisRecord {
  id: number;
  resume_filename: string;
  job_title: string;
  overall_score: number;
  created_at: string;
}

export function DashboardPage() {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/history');
        setHistory(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/history/${id}`);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-8 border-b border-border-subtle pb-6">
        <div>
          <h2 className="text-3xl font-bold text-text-main">Dashboard</h2>
          <p className="text-muted mt-2">View and manage your recent resume analyses.</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/" className="px-4 py-2 border border-border-subtle rounded-lg text-text-main hover:bg-gray-50 flex items-center font-medium">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <Link to="/analyze" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center font-bold shadow-sm shadow-primary/20">
            New Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border-subtle rounded-2xl">
          <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">No analyses yet</h3>
          <p className="text-muted mb-6">You haven't analyzed any resumes yet. Start by comparing a resume to a job description.</p>
          <Link to="/analyze" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary font-bold inline-flex items-center">
            Analyze Resume Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((record) => (
            <div key={record.id} className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={clsx("text-4xl font-extrabold tracking-tight", getScoreColor(record.overall_score))}>
                  {record.overall_score}<span className="text-lg text-muted font-normal">/100</span>
                </div>
                <button onClick={() => handleDelete(record.id)} className="text-muted hover:text-danger transition-colors p-1" title="Delete record">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-xs text-muted uppercase font-semibold tracking-wider mb-1">Job Title</div>
                  <div className="font-bold text-text-main line-clamp-1">{record.job_title}</div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase font-semibold tracking-wider mb-1 mt-3">Resume</div>
                  <div className="text-text-main text-sm line-clamp-1 break-all flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-muted" />
                    {record.resume_filename}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between items-center text-sm">
                <span className="text-muted">{new Date(record.created_at).toLocaleDateString()}</span>
                {/* Full detailed view can be built by adding a route /history/:id */}
                <button className="text-primary font-medium hover:underline flex items-center" onClick={() => alert('View detailed history coming soon!')}>
                  View Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
