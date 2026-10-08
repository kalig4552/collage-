import React from 'react';
import { Award, GraduationCap, Building2, BookCheck, Sparkles, Rocket, CheckCircle } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Academic Project Profile & Methodology</h2>
        <p className="text-xs text-slate-400">
          Institutional attribution, theoretical rationale, end-to-end data science lifecycle, and viva defense parameters
        </p>
      </div>

      {/* Candidate & Institution Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
              Academic Project Specification
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100">
              College Library Management Data Analysis
            </h1>
            <p className="text-sm text-slate-300">
              Data-driven insights for better library management
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-300 font-mono">
            <div className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">Academic Credential</div>
            <div><strong>Student:</strong> Kali Gupta</div>
            <div><strong>Degree:</strong> B.Sc. Data Science</div>
            <div><strong>Semester:</strong> V</div>
            <div><strong>College:</strong> D.T.S.S. College of Commerce (Autonomous)</div>
            <div><strong>University:</strong> University of Mumbai</div>
          </div>
        </div>
      </div>

      {/* Research Rationale */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BookCheck className="w-4 h-4 text-indigo-400" />
          <span>Project Abstract & Problem Rationale</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Traditional college libraries maintain transactional checkout databases purely for record-keeping and audit accounting.
          However, these logs contain rich, untapped behavioral indicators regarding student curricular focus, reading habit intensity,
          textbook stockout vulnerabilities, and overdue fine compliance patterns.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          This academic project demonstrates how formal Data Science methodologies—including automated hygiene transformations,
          chronological feature engineering, exploratory univariate/multivariate distributions, and deterministic replenishment rules—can
          turn static CSV records into a proactive decision-support system for library administrators and academic department heads.
        </p>
      </div>

      {/* Complete Methodology Workflow */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Complete 10-Stage Academic Methodology Lifecycle</span>
          </h3>
          <span className="text-xs font-mono text-indigo-400">Strict Data Science Pipeline</span>
        </div>

        <div className="space-y-3">
          {[
            {
              step: '1. Data Collection',
              desc: 'Sourcing library circulation transaction records covering student demographics, book metadata, timestamps, and status markers.',
            },
            {
              step: '2. Data Cleaning',
              desc: 'Eliminating duplicate transaction logs, stripping invalid whitespace, and standardizing text casings.',
            },
            {
              step: '3. Data Preprocessing',
              desc: 'Parsing ISO datetimes, validating chronological sequences (Issue Date ≤ Due Date), and handling missing returns.',
            },
            {
              step: '4. Feature Engineering',
              desc: 'Synthesizing derived fields: Loan_Days, Overdue_Days, Month, Year_Month, Quarter, and Is_Overdue flag.',
            },
            {
              step: '5. Exploratory Data Analysis (EDA)',
              desc: 'Computing central tendencies (mean, median), dispersion (standard deviation), and demographic distributions.',
            },
            {
              step: '6. Data Visualization',
              desc: 'Generating dynamic temporal trends, category breakdowns, course distributions, and status ratio diagrams.',
            },
            {
              step: '7. Statistical Analysis',
              desc: 'Calculating Pearson correlation matrices and departmental course-versus-category cross-tabulation contingencies.',
            },
            {
              step: '8. Insight Generation',
              desc: 'Deriving empirical circulation velocity, student engagement leaderboards, and overdue delinquency rates.',
            },
            {
              step: '9. Recommendations',
              desc: 'Executing deterministic inventory threshold rules to recommend book restocks and reorders without external AI.',
            },
            {
              step: '10. Reporting & Exports',
              desc: 'Synthesizing executive summaries and providing instant RFC-4180 CSV downloads for institutional records.',
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
              <span className="font-mono font-bold text-indigo-400 w-6 flex-shrink-0">{idx + 1}.</span>
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">{item.step.split('. ')[1]}</span>
                <p className="text-slate-400 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Scope */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Future Scope (Post-Prototype Institutional Roadmap)</h3>
        </div>
        <p className="text-xs text-slate-400">
          The current application represents a complete, self-contained, API-free data science prototype. Planned extensions for enterprise deployment include:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { title: 'Complete Library Management System', desc: 'Full bibliographic cataloguing and circulation counter checkout/checkin.' },
            { title: 'Online Book Reservation', desc: 'Real-time student hold requests and queue notifications.' },
            { title: 'Barcode / QR Integration', desc: 'Direct WebUSB or camera-based scanning of book barcodes.' },
            { title: 'Student & Librarian Login', desc: 'Role-based access control with single sign-on (SSO).' },
            { title: 'Mobile Application', desc: 'Cross-platform app for book searches, renewals, and fine payments.' },
            { title: 'Machine Learning Demand Prediction', desc: 'Time-series forecasting models (Prophet/ARIMA) predicting peak textbook demand.' },
            { title: 'Recommendation System', desc: 'Collaborative filtering recommender suggesting relevant readings based on syllabus.' },
            { title: 'Cloud Deployment', desc: 'Containerized Docker deployment on institutional server infrastructure.' },
          ].map((scope, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{scope.title}</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">{scope.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
