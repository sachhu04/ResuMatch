import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AnalyzePage } from './components/AnalyzePage';
import { DashboardPage } from './components/DashboardPage';
import { DocumentationPage } from './components/DocumentationPage';
import { DemoPage } from './components/DemoPage';

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-8 py-6 border-b border-border-subtle flex justify-between items-center bg-surface">
        <h1 className="text-2xl font-bold text-text-main tracking-tight">ResuMatch</h1>
        <nav className="flex space-x-6">
          <Link to="/docs" className="text-muted hover:text-text-main transition-colors font-medium">How it Works</Link>
          <Link to="/demo" className="text-muted hover:text-text-main transition-colors font-medium">View Demo</Link>
          <Link to="/dashboard" className="text-muted hover:text-text-main transition-colors font-medium">Dashboard</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
        <h2 className="text-5xl lg:text-6xl font-extrabold text-text-main max-w-4xl tracking-tight mb-6 leading-tight">
          Know exactly how well your resume fits the job.
        </h2>
        <p className="text-xl text-muted max-w-2xl mb-12 leading-relaxed">
          ResuMatch analyzes your resume against job descriptions using true NLP and semantic embeddings to uncover strengths, gaps, and compatibility.
        </p>
        <div className="flex space-x-4">
          <Link to="/analyze" className="px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-secondary transition-all shadow-md shadow-primary/20">
            Analyze Resume
          </Link>
          <Link to="/demo" className="px-8 py-4 bg-surface text-text-main border border-border-subtle rounded-lg font-bold text-lg hover:bg-gray-50 transition-all shadow-sm">
            View Demo
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="p-6 bg-surface rounded-xl border border-border-subtle shadow-sm">
            <h3 className="text-xl font-bold text-text-main mb-3">NLP-Powered Analysis</h3>
            <p className="text-muted">Extracts skills, experience, and education intelligently without relying on simple keyword matching.</p>
          </div>
          <div className="p-6 bg-surface rounded-xl border border-border-subtle shadow-sm">
            <h3 className="text-xl font-bold text-text-main mb-3">Semantic Matching</h3>
            <p className="text-muted">Uses contextual sentence embeddings to understand the meaning behind your bullet points and job requirements.</p>
          </div>
          <div className="p-6 bg-surface rounded-xl border border-border-subtle shadow-sm">
            <h3 className="text-xl font-bold text-text-main mb-3">Skill Gap Detection</h3>
            <p className="text-muted">Automatically identifies missing, partial, and related skills so you know exactly what to improve.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-muted text-sm border-t border-border-subtle bg-surface">
        <p>&copy; {new Date().getFullYear()} ResuMatch. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
